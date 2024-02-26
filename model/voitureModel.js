const mongoose = require('mongoose');

const voitureSchema = new mongoose.Schema({
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  marque: {
    type: String,
    required: true,
  },
  modele: {
    type: String,
    required: true,
  },
  annee: {
    type: Number,
    required: true,
  },
  capacite: {
    type: Number,
    required: true,
  },
});

const Voiture = mongoose.model('Voiture', voitureSchema);

module.exports = Voiture;
