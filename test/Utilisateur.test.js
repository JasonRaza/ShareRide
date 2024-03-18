const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../model/utilisateurModel');

describe('Test du modèle Utilisateur', () => {
  // Définir un utilisateur de test pour les tests
  const user = {
    username: 'testuser',
    password: 'testpassword',
    email: 'test@example.com',
    prenom: 'John',
    nom: 'Doe',
    numeroTel: '123456789',
    adresse: '123 Rue de Test',
    voitures: []
  };

  beforeAll(async () => {
    
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Déconnectez-vous de la base de données après les tests
    await mongoose.connection.close();
  });

  it('devrait créer un nouvel utilisateur avec succès', async () => {
    // Créez un nouvel objet utilisateur
    const newUser = new Utilisateur(user);

    // Enregistrez l'utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Vérifiez que l'utilisateur enregistré a été correctement créé avec un ID
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(user.username);
    expect(savedUser.email).toBe(user.email);
   
  });

  it('devrait hasher le mot de passe avant d\'enregistrer l\'utilisateur', async () => {
    const newUser = new Utilisateur(user);
    
    // Enregistrez l'utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Vérifiez que le mot de passe enregistré est hashé
    expect(savedUser.password).not.toBe(user.password);
    
    // Utilisez bcrypt pour vérifier si le mot de passe non hashé correspond au hash enregistré dans la base de données
    const isMatch = await bcrypt.compare(user.password, savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('devrait comparer les mots de passe avec succès', async () => {
    const newUser = new Utilisateur(user);
    
    // Enregistrez l'utilisateur dans la base de données
    await newUser.save();

    // Utilisez la méthode comparePassword pour comparer le mot de passe avec succès
    newUser.comparePassword(user.password, (err, isMatch) => {
      expect(isMatch).toBe(true);
    });
  });
});
