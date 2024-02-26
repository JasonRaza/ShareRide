const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema({
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  pointDepart: {
    type: String,
    required: true,
  },
  pointDestination: {
    type: String,
    required: true,
  },
  dateDepart: {
    type: Date,
    required: true,
  },
  heureDepart: {
    type: String,
    required: true,
  },
  voiture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voiture',
    required: true,
  },
});

const Trajet = mongoose.model('Trajet', trajetSchema);

module.exports = Trajet;
