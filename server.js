const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./config/database');
const dayjs = require('dayjs');
const  format  = require('date-fns');
const crypto = require('crypto');
const Trajet = require('./model/trajetModel');
const Voiture = require('./model/voitureModel');
const app = express();
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Utilisateur = require('./model/utilisateurModel');
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));

const generateSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};
app.use(session({
    secret: generateSecret(),
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy ({usernameField: 'email'}, async(email, password, done) => {
    try{
        const user = await Utilisateur.findOne({email});
        if(!user){
            return done(null, false, {message: 'Utilisateur non trouvé'});
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return done(null, false, {message: 'Mot de passe incorrect'});
        }
        return done(null, user);
    }catch(e){
        return done(e);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Utilisateur.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//Connection à la bd
connectDB();

//Page d'accueil (index)
app.get('/', (req,res) => {
    try {
        res.render('index');
        console.log("Page index ouvert")
    }
    catch(error){
        console.log('Erreur ouverture page')
    }
});

//affiche le formulaire de connection
app.get('/se-connecter', (req, res) => {
    res.render('connecter');
})

//connection avec la logique passport.authenticate
app.post('/se-connecter', passport.authenticate('local', {
    successRedirect: '/profil', // rediriger vers le profil en cas de succès
    failureRedirect: '/se-connecter', // rediriger vers la page de connexion en cas d'échec
}));



//route de création de compte (creer-compte)
app.get('/creer-compte', (req,res) => {
    try {
        res.render('creer-compte');
        console.log("Page creer compte ouvert")
    }
    catch(error){
        console.log('Erreur ouverture page')
    }
});

//inscription
app.post('/inscription', async (req,res) =>{
    try{
        const { prenom, nom, email, password, numeroTelephone} = req.body;
        const username = prenom.toLowerCase() + '.' + nom.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);

        const nouvelUtilisateur = new Utilisateur({
            username, 
            password: hashedPassword, 
            email,
            nom,
            prenom,
            numeroTel : numeroTelephone,
            email

        });

        await nouvelUtilisateur.save();
        res.render('connecter');
    }catch(err){
        console.error(err);
        res.redirect('/creer-compte');
    }
});


// Page de profil
app.get('/profil', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/se-connecter');
    }
    const { nom, prenom } = req.user;

    try {
        let trajets = await Trajet.find({ conducteur: req.user._id} ).populate('voiture');
        const voitures = await Voiture.find({ conducteur: req.user._id });

        // Formater les trajets pour l'affichage
        trajets = trajets.map(trajet => {
            const dateDepart = trajet.dateDepart ? trajet.dateDepart.toLocaleDateString('fr-FR') :'';
            const heureDepart = trajet.heureDepart;
            return {
                ...trajet.toObject(), // Convertir le document Mongoose en objet JS
                dateDepart,
                heureDepart,
                conducteurNom: trajet.conducteur ? trajet.conducteur.nom : '',
                conducteurPrenom: trajet.conducteur ? trajet.conducteur.prenom : ''
            };
        });

        res.render('profil', { nom, prenom, trajets, voitures });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des trajets');
    }
});

app.post('/creer-voiture', async (req, res) => {
    try {
        const { marque, modele, annee, capacite } = req.body;
        const nouvelleVoiture = new Voiture({
            conducteur: req.user._id,
            marque,
            modele,
            annee,
            capacite
        });
        await nouvelleVoiture.save();

        //ajout de la voiture dans les voitures de l'utilisateur
        const utilisateur = await Utilisateur.findById(req.user._id);
        utilisateur.voitures.push(nouvelleVoiture._id);
        await utilisateur.save();
        res.redirect('/profil');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la voiture.' });
    }
});

app.post('/creer-trajet', async (req, res) => {
    try {
        const { pointDepart, pointArrivee, dateDepart, heureDepart, voiture: voitureID } = req.body;

        // Combinez la date et l'heure de départ pour créer un objet Date complet
        const [heure, minute] = heureDepart.split(':');
        const datetimeDepart = new Date(dateDepart);
        datetimeDepart.setHours(heure, minute);

        // Créez un nouveau document Trajet avec les données reçues
        const nouveauTrajet = new Trajet({
            conducteur:req.user._id,
            pointDepart,
            pointDestination: pointArrivee,
            dateDepart: datetimeDepart,
            heureDepart,
            voiture: voitureID
        });

        console.log(req.body);
        // Enregistrez le nouveau trajet dans la base de données
        await nouveauTrajet.save();
        console.log('Trajet créé : ', nouveauTrajet);
        res.status(200).json({ message: 'Le trajet a été créé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du trajet.' });
    }
});


app.post('/rechercher-trajet', async (req, res) => {
    try{
        const{ pointDepart, pointDestination } = req.body;
        let critereRecherche={};
        
        if (pointDepart && pointDestination){
            critereRecherche = {pointDepart: pointDepart, pointDestination: pointDestination};
        } else if(pointDepart){
            critereRecherche = { pointDepart: pointDepart};
        }else if(pointDestination){
            critereRecherche = { pointDestination: pointDestination};
        }
            
        const trajetsTrouves = await Trajet.find(critereRecherche);

        if(trajetsTrouves.length > 0){
            res.render('resultat-recherche', { trajets: trajetsTrouves, message: 'Trajet trouvé'});
            console.log('Point de départ:', pointDepart);
            console.log('Point de destination:', pointDestination);
            console.log('Critères de recherche:', critereRecherche);
            
        } else{
            res.render('resultat-recherche', { trajets : [], message: 'Trajet non trouvé'});
        }
    }catch(err){
        console.error(err);
        res.status(500).send('Erreur lors de la recherche de trajets');
    }
});

app.post('/reserver-trajet', async(req, res) => {
    const trajetId = req.body.trajetId;
    const utilisateurId = req.user._id;
    try{
        const trajet = await Trajet.findById(trajetId).populate('voiture');
        if(!trajet.reservation && trajets.passagers && trajet.passagers.length < trajet.voiture.capacite) {
            trajet.passagers.push(utilisateurID);
            if(trajet.passagers.length >= trajet.voiture.capacite){
                trajet.reservation = true;
            }
        
        await trajet.save();
        res.redirect('/confirmation-reservation');
    } else {
        res.send("Réservation impossible, le trajet est complet ou déjà réservé.");
        }
    } catch(err){
        console.error(err);
        res.status(500).send("Erreur lors de la réservation du trajet");
        }
});


app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Erreur lors de la déconnexion :', err);
                return res.status(500).send('Erreur lors de la déconnexion');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});


//Message dans le terminal qui indique le port lorsque le serveur est lancé
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});