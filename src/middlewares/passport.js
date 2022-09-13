const User = require("../models/User");
const Company = require("../models/Company");
const Admin = require("../models/Admin");
const { SECRET } = require("../config");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (passport) => {
    passport.use('local-login', new JwtStrategy({
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true
    },
    async (req, payload, done) => {
        let schema;

        switch (payload.role) {
            case 'user':
                schema = User;
                break;
            case 'company':
                schema = Company;
                break;
            case 'admin':
                schema = Admin;
                break;
            default:
                return done(null, false);
        }

        //console.log('payload', payload);
        await schema.findById(payload.user_id)
            .then(user => {
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => {
                //console.log(err);
                return done(null, false);
            });
    }));

    passport.use('local-signup', new JwtStrategy({
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    async (req, email, password, done) => {
        
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
