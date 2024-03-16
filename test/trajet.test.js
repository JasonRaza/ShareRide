const mongoose = require('mongoose');
const Trajet = require('../model/trajetModel');

describe('Test du modèle Trajet', () => {
    // Augmente le délai d'attente pour les hooks beforeAll et afterAll
    jest.setTimeout(10000); 
  
    beforeAll(async () => {
      
      await mongoose.connect('mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    afterAll(async () => {
      // Déconnect de la base de données après les tests
      await mongoose.connection.close();
    });

  it('devrait créer un nouveau trajet avec succès', async () => {
    // Créez un nouvel objet trajet
    const newTrajet = new Trajet({
      conducteur: 'id_conducteur',
      pointDepart: 'Point de départ',
      pointDestination: 'Point d\'arrivée',
      dateDepart: new Date(),
      heureDepart: '12:00',
      voiture: 'id_voiture',
    });

    // Enregistrez le trajet dans la base de données
    const savedTrajet = await newTrajet.save();

    // Vérifiez que le trajet enregistré a été correctement créé avec un ID
    expect(savedTrajet._id).toBeDefined();
    expect(savedTrajet.conducteur).toBe('id_conducteur');
    expect(savedTrajet.pointDepart).toBe('Point de départ');
    expect(savedTrajet.pointDestination).toBe('Point d\'arrivée');

  });
});
