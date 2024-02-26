const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Utilisateur = require('.../model/utilisateurModel');

//configuration de la stratégie locale pour Passport
passport.use(new LocalStrategy({usernameField: 'email' },
(email, password, done) => {
    Utilisateur.findOne({ email:email }, (err, utilisateur) => {
        if (err) { return done(err);}
        if (!utilisateur) {
            return done(null, false, {message: 'Adresse email non reconnue.'});
        }
        utilisateur.comparePassword(password, (err, isMatch) => {
            if (err) { return done(err); }
            if (!isMatch) {
                return done(null, false, {message: 'Mot de passe incorrect.'});
            }
            return done(null, user);
        });
    });
}
));

passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id);
});

passport.deserializeUser((id, done) => {
    Utilisateur.findById(id, function(err, utilisateur) {
        done(err, user);
    });
});

module.exports = passport;