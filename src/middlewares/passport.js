const User = require('../models/User');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { USER, COMPANY, ADMIN } = require('../utils/constants');
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

		if (!role) {
			return done(null, false);
		}

		let user;

		try {
			if (role === USER) {
				user = await User.findById(jwt_payload.user_id);
			} else if (role === COMPANY) {
				user = await Company.findById(jwt_payload.user_id);
			} else if (role === ADMIN) {
				user = await Admin.findById(jwt_payload.user_id);
			}
		} catch (err) {
			return done(err, false);
		}
		if (!user) {
			return done(null, false);
		}
		
		user.role = role;
		return done(null, user);
	}));

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
};
