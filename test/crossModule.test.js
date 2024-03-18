const assert = require('chai').assert;
const sinon = require('sinon');
const Utilisateur = require('../model/utilisateurModel');
const Voiture = require('../model/voitureModel');
const Trajet = require('../model/trajetModel');

describe('Cross Module Tests', function() {
    describe('User-Vehicle Interaction', function() {
        it('devrait permettre à un utilisateur d\'être associé à une voiture', async function() {
            // Créer un utilisateur et une voiture
            const utilisateur = new Utilisateur({
                username: 'testuser',
                password: 'password',
                email: 'test@example.com',
                prenom: 'John',
                nom: 'Doe',
                numeroTel: '1234567890'
            });
            const voiture = new Voiture({
                conducteur: utilisateur._id,
                marque: 'Toyota',
                modele: 'Camry',
                annee: 2020,
                plaque: 'ABC123',
                capacite: 5
            });

            await utilisateur.save();
            await voiture.save();

            // Vérifier que l'utilisateur est associé à la voiture
            const userWithCar = await Utilisateur.findById(utilisateur._id).populate('voitures');
            assert.exists(userWithCar.voitures[0]);
            assert.equal(userWithCar.voitures[0].marque, 'Toyota');
        });
    });

    describe('User-Trip Interaction', function() {
        it('devrait permettre à un utilisateur de créer un trajet', async function() {
            // Créer un utilisateur
            const utilisateur = new Utilisateur({
                username: 'testuser2',
                password: 'password',
                email: 'test2@example.com',
                prenom: 'Jane',
                nom: 'Doe',
                numeroTel: '9876543210'
            });
            await utilisateur.save();

            // Créer un trajet avec cet utilisateur
            const trajet = new Trajet({
                conducteur: utilisateur._id,
                passagers: [],
                pointDepart: 'Point A',
                pointDestination: 'Point B',
                dateDepart: new Date(),
                heureDepart: '10:00',
                voiture: null // À définir
            });
            await trajet.save();

            // Vérifier que le trajet a été créé avec succès
            const savedTrajet = await Trajet.findById(trajet._id);
            assert.exists(savedTrajet);
            assert.equal(savedTrajet.conducteur.toString(), utilisateur._id.toString());
        });
    });
});
