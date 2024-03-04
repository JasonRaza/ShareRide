const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./config/database');
const crypto = require('crypto');
const utilisateurModel = require('./model/utilisateurModel');
const Trajet = require('./model/trajetModel');
const app = express();
const path = require('path');
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

//Page de connection (se-connecter)
app.get('/se-connecter', (req,res) => {
    try {
        res.render('connecter');
        console.log("Page se connecter ouvert")
    }
    catch(error){
        console.log('Erreur ouverture page')
    }
});

//Page de création de compte (creer-compte)
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

        const nouvelUtilisateur = new utilisateurModel({
            username, 
            password, 
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
    }
})

app.post('/profil', async (req, res)=> {
    try{
        const { email, password} = req.body;
        
        const utilisateur = await utilisateurModel.findOne({email});

        if(!utilisateur){
            return res.status(404).send('Utilisateur non trouvé');
        }

        const isMatch = await bcrypt.compare(password, utilisateur.password);
        if(!isMatch){
            return res.status(401).send('Mot de passe incorrect');
        }

        const nom = utilisateur.nom;
        const prenom = utilisateur.prenom;

        //Capitalise la premiere lettre du nom et du prenom
        const nomCapitalise = nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
        const prenomCapitalise = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();

        let trajets= await Trajet.find(); 
        //console.log(trajets); J'ai mis en commentaire sinon ca rempli trop le terminal, enlever commentaire pour tester


        res.render('profil', { nom: nomCapitalise, prenom: prenomCapitalise, trajets });        
        console.log('Page profil utilisateur ouvert.');

    }catch(err){
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des trajets');
    }
})

app.post('/creer-trajet', async (req, res)=> {
    try{
        const { depart, arrivee, dateDepart, heureDepart, voiture } = req.body;
        
        const userId = req.session.userId;
        
        const nouveauTrajet = new Trajet({
            pointDepart: depart,
            pointDestination: arrivee,
            dateDepart: dateDepart,
            heureDepart: heureDepart,
            voiture: voiture,
            con
 :ruetcu
        })

        await nouveauTrajet.save();
    }catch(error){
        console.error(error);
        res.status(500).send('Erreur lors de la création du trajet');
    }
})

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