const mongoose = require('mongoose');
const Voiture = require('../model/voitureModel');

describe('Test du modèle Voiture', () => {
  // Définir une voiture de test pour les tests
  const car = {
    conducteur: 'id_conducteur',
    marque: 'Toyota',
    modele: 'Corolla',
    annee: 2020,
    plaque: 'ABC123',
    capacite: 5
  };

  beforeAll(async () => {
  
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Déconnecter de la base de données après les tests
    await mongoose.connection.close();
  });

  it('devrait créer une nouvelle voiture avec succès', async () => {
    // Créez un nouvel objet voiture
    const newCar = new Voiture(car);

    // Enregistrez la voiture dans la base de données
    const savedCar = await newCar.save();

    // Vérifiez que la voiture enregistrée a été correctement créée avec un ID
    expect(savedCar._id).toBeDefined();
    expect(savedCar.marque).toBe(car.marque);
    expect(savedCar.modele).toBe(car.modele);
  
  });
});
