const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const utilisateurModel = require('./model/utilisateurModel');
const app = express();
const path = require('path');
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));

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

app.post('/connexion', async (req, res)=> {
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
        res.render('profil');
    }catch(err){
        console.error(err);
    }
})

//Page de profil utilisateur
app.get('/profil', (req,res) => {
    try {
        res.render('profil', {nom, prenom});
        console.log("Page profil utilisateur ouvert")
    }
    catch(error){
        console.log('Erreur ouverture page profil utilisateur')
    }
});

//Message dans le terminal qui indique le port lorsque le serveur est lancé
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});