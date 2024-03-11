const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Utilisateur = require('../model/utilisateurModel');

//configuration de la stratégie locale pour Passport
passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            const utilisateur = await Utilisateur.findOne({ email: email });
            if (!utilisateur) {
                return done(null, false, { message: 'Adresse email non reconnue.' });
            }
            utilisateur.comparePassword(password, (err, isMatch) => {
                if (err) { return done(err); }
                if (!isMatch) {
                    return done(null, false, { message: 'Mot de passe incorrect.' });
                }
                return done(null, utilisateur);
            });
        } catch (err) {
            return done(err);
        }
    }
));


passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const utilisateur = await Utilisateur.findById(id);
        done(null, utilisateur);
    } catch (err) {
        done(err);
    }
});


module.exports = passport;