const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dayjs = require('dayjs');
const app = express();
const path = require('path');
const flash = require('connect-flash');

const connectDB = require('./config/database');
const Trajet = require('./model/trajetModel');
const Voiture = require('./model/voitureModel');
const Utilisateur = require('./model/utilisateurModel');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());


// Configuration de Passport
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async function(email, password, done) {
      try {
        const user = await Utilisateur.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    Utilisateur.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});



// Express session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));
  
// Initialisation de Passport et utilisation des sessions
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//Connection à la bd
connectDB();

// Connexion avec la logique passport.authenticate
app.post('/se-connecter', passport.authenticate('local', {
    successRedirect: '/profil',
    failureRedirect: '/se-connecter',
    failureFlash: true
}));




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
app.post('/inscription', async (req, res) =>{
    try {
        const { prenom, nom, email, password, numeroTelephone } = req.body;
        const username = prenom.toLowerCase() + '.' + nom.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe hashé:', hashedPassword);

        const nouvelUtilisateur = new Utilisateur({
            username,
            password: hashedPassword,
            email,
            nom,
            prenom,
            numeroTel: numeroTelephone
        });

        await nouvelUtilisateur.save();
        console.log('Nouvel utilisateur enregistré:', nouvelUtilisateur);
        res.render('connecter');
    } catch (err) {
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
        let trajetsUtilisateur = await Trajet.find({ conducteur: req.user._id }).populate('voiture');
        let trajets = await Trajet.find();
        let trajetsReserves = await Trajet.find({passagers: req.user._id}).populate('voiture');
        const voitures = await Voiture.find({ conducteur: req.user._id });

        trajetsUtilisateur = trajetsUtilisateur.map(trajet => {
            const dateDepart = trajet.dateDepart ? trajet.dateDepart.toLocaleDateString('fr-FR') : '';
            const heureDepart = trajet.heureDepart;
            return {
                ...trajet.toObject(), // Convertir le document Mongoose en objet JS
                dateDepart,
                heureDepart,
                conducteurNom: trajet.conducteur ? trajet.conducteur.nom : '',
                conducteurPrenom: trajet.conducteur ? trajet.conducteur.prenom : ''
            };
        });

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

        
        res.render('profil', { nom, prenom, trajets, voitures, trajetsUtilisateur });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des trajets');
    }
});




// Route pour sauvegarder les modifications des trajets
app.post('/modifier-trajet', async (req, res) => {
    try {
        const { trajetId, pointDepart, pointDestination } = req.body;
        console.log('Champs édités pour le trajet avec l\'ID :', trajetId);
        console.log('Nouveau point de départ :', pointDepart);
        console.log('Nouveau point de destination :', pointDestination);
      
        const updatedTrajet = await Trajet.findByIdAndUpdate(trajetId, { pointDepart, pointDestination }, { new: true });

        if (updatedTrajet) {
            res.status(200).send('Le trajet a été mis à jour avec succès.');
        } else {
            res.status(404).send('Le trajet spécifié n\'a pas été trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur s\'est produite lors de la mise à jour du trajet.');
    }
});

app.post('/effacer-trajet', async (req, res) => {
    try {
        const trajetId = req.body.trajetId; 
        console.log('ID du trajet à supprimer :', trajetId);

        await Trajet.findByIdAndDelete(trajetId);

        res.status(200).send('Le trajet a été supprimé avec succès.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur s\'est produite lors de la suppression du trajet.');
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
        res.redirect('/profil');
        //res.status(200).json({ message: 'Le trajet a été créé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du trajet.' });
    }
});


app.post('/rechercher-trajet', async (req, res) => {
    try {
        const { pointDepart, pointArrivee } = req.body;
        let critereRecherche = {};

        const regexPointDepart = new RegExp(pointDepart, 'i');
        const regexPointArrivee = new RegExp(pointArrivee, 'i');

        if (pointDepart && pointArrivee) {
            critereRecherche = {
                pointDepart: regexPointDepart,
                pointDestination: regexPointArrivee
            };
        } else if (pointDepart) {
            critereRecherche = { pointDepart: regexPointDepart };
        } else if (pointArrivee) {
            critereRecherche = { pointDestination: regexPointArrivee };
        }

        const trajetsTrouves = await Trajet.find(critereRecherche);

        if (trajetsTrouves.length > 0) {
            res.render('resultat-recherche', { trajets: trajetsTrouves, message: 'Trajet trouvé' });
            console.log('Point de départ:', pointDepart);
            console.log('Point d\'arrivée:', pointArrivee);
            console.log('Critères de recherche:', critereRecherche);
        } else {
            res.render('resultat-recherche', { trajets: [], message: 'Trajet non trouvé' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la recherche de trajets');
    }
});



app.post('/reserver-trajet', async (req, res) => {
    try {
        const trajetId = req.body.trajetId;
        const utilisateurId = req.user._id;

        if (!utilisateurId) {
            return res.render('resultat-recherche', { message: 'Vous devez être connecté pour réserver un trajet.', trajets: [] });
        }

        const trajet = await Trajet.findById(trajetId);

        // Vérifiez si le trajet existe
        if (!trajet) {
            return res.render('resultat-recherche', { message: 'Trajet non trouvé.', trajets: [] });
        }

        // Vérifiez si le trajet est déjà réservé
        if (trajet.reservation) {
            return res.render('resultat-recherche', { message: 'Ce trajet est déjà réservé.', trajets: [] });
        }

        // Vérifiez si le trajet est complet
        if (trajet.passagers.length >= trajet.voiture.capacite) {
            return res.render('resultat-recherche', { message: 'Ce trajet est complet.', trajets: [] });
        }

        // Vérifiez si l'utilisateur est déjà dans la liste des passagers
        if (trajet.passagers.includes(utilisateurId)) {
            return res.render('resultat-recherche', { message: 'Vous êtes déjà inscrit à ce trajet.', trajets: [] });
        }

        trajet.passagers.push(utilisateurId);

        // Si le nombre de passagers atteint la capacité maximale de la voiture, marquez le trajet comme réservé
        if (trajet.passagers.length >= trajet.voiture.capacite) {
            trajet.reservation = true;
        }
        
        await trajet.save();
        return res.render('resultat-recherche', { message: 'Trajet réservé avec succès !', trajets: [] });
    } catch (err) {
        console.error(err);
        return res.render('resultat-recherche', { message: 'Erreur lors de la réservation du trajet', trajets: [] });
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