const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Utilisateur = require('../model/utilisateurModel');
const authentification = require('../authentification'); 

describe('Authentification', () => {
    describe('Local Strategy', () => {
        let authenticate;

        beforeAll(() => {
            // Créer une stratégie locale pour tester
            passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
                try {
                    const utilisateur = await Utilisateur.findOne({ email: email });
                    if (!utilisateur) {
                        return done(null, false, { message: 'Adresse email non reconnue.' });
                    }
                    const isMatch = await utilisateur.comparePassword(password);
                    if (!isMatch) {
                        return done(null, false, { message: 'Mot de passe incorrect.' });
                    }
                    return done(null, utilisateur);
                } catch (err) {
                    return done(err);
                }
            }));
            authenticate = jest.spyOn(passport, 'authenticate');
        });

        afterAll(() => {
            authenticate.mockRestore(); // Restaurer la fonction authenticate de Passport après les tests
        });

        it('devrait authentifier un utilisateur avec des identifiants valides', () => {
            // Simuler une authentification réussie avec des identifiants valides
            const req = { body: { email: 'test@example.com', password: 'password' } };
            const res = {};
            const next = jest.fn();

            authenticate.mockImplementation((strategy, callback) => {
                return (req, res, next) => {
                    callback(null, { email: 'test@example.com' });
                };
            });

            authentification(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it('devrait rejeter l\'authentification avec des identifiants invalides', () => {
            // Simuler une authentification échouée avec des identifiants invalides
            const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
            const res = {};
            const next = jest.fn();

            authenticate.mockImplementation((strategy, callback) => {
                return (req, res, next) => {
                    callback(null, false);
                };
            });

            authentification(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });
    });
});
