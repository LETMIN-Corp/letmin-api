const User = require('../models/User');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { SECRET } = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

/**
 * JWT Strategy
 * 
 * Takes the token from the header and verifies it
 */
module.exports = (passport) => {
	passport.use('jwt', new JwtStrategy({
		secretOrKey: SECRET,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		passReqToCallback: true
	},
	async (req, jwt_payload, done) => {
		const { role } = jwt_payload;

		let user;
		if (role === 'user') {
			user = await User.findById(jwt_payload.user_id);
		} else if (role === 'company') {
			user = await Company.findById(jwt_payload.user_id);
		} else if (role === 'admin') {
			user = await Admin.findById(jwt_payload.user_id);
		}
		if (user) {

			user.role = role;
			return done(null, user);
		}
		
		return done(null, false);
	}));

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
};
