const User = require("../models/User");
const { SECRET } = require("../config");
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config();

module.exports = (passport) => {
    passport.use('local-login', new JwtStrategy({
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true
    },
    async (req, payload, done) => {
        await User.findById(payload.user_id)
            .then(user => {
            if (user) {
                return done(null, user);
            }
            return done(null, false);
            })
            .catch(err => {
            return done(null, false);
            });
    }));

    passport.use('local-signup', new JwtStrategy({
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    (req, email, password, done) => {
        if (email) {
            User.findOne({ 'email': email }, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, false);
                } else {
                    const newUser = new User();
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.save((err) => {
                        if (err) {
                            return done(err);
                        }
                        return done(null, newUser);
                    });
                }
            });
        }
    }));

    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    }, (accessToken, refreshToken, profile, done) => {
        console.log('profile', profile);
        User.findOne({ googleId: profile.sub }, async (err, user) => {
            if (err) { return done(err); }
            // Insert user in DB
            if (!user) {
                var newUser = new User();
                newUser.googleId = profile.sub;
                newUser.name = profile.name.givenName;
                newUser.surname = profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.avatar = profile.photos[0].value;

                newUser.save((err) => {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newUser);
                });
            }
            done(null, profile);
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.googleId || user.id);
    });
    
    passport.deserializeUser((googleId, done) => {
        User.findOne({ googleId : googleId }, (err, user) => {
            done(null, user);
        });
    });
};
