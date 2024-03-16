const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema({
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  passagers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
}],
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
  }
});

/*
trajetSchema.methods.reserver = funciton(){
  if(this.passagers.length >= this.voiture.nombrePlaces){
  this.reservation = true;
  }
};
*/
const Trajet = mongoose.model('Trajet', trajetSchema);

module.exports = Trajet;
