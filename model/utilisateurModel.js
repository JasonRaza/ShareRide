// Utilisateur model
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

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


utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);
module.exports = Utilisateur;
