const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

//schéma des utilisateurs
const utilisateurSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    prenom: {
        type: String, 
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    numeroTel: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: false
    },
    voitures: [{type : mongoose.Schema.Types.ObjectID, ref:'voiture'}]
});

//s'exécute avant d'enregistrer dans mongodb
//hash le mdp de l'utilisateur
utilisateurSchema.pre('save', async function (next) {
    try{
        if (this.isModified('password') || this.isNew) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
    next();
    } catch (error) {
        next(error);
    }    
});

//compare le mdp inscrit dans le input avec le mdp hashé dans la bd
utilisateurSchema.methods.comparePassword = function(passwordInput, callback){
    bcrypt.compare(passwordInput, this.password, (err, isMatch) => {
        callback(null, isMatch);
    });
};

const Utilisateur = mongoose.model('utilisateur', utilisateurSchema);

module.exports = Utilisateur;

