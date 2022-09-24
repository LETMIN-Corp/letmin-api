const passport = require('passport');

/**
 * @DESC Passport middleware
 * Check if user is authenticated
 */
const passportAuth = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (err, user) => {
		if (err) {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel autenticar usuário.',
				error: err,
			});
		}
		if (!user) {
			return res.status(403).json({
				success: false,
				message: 'Token inválido.',
			});
		}
		req.user = user;
		next();
	})(req, res, next);
};
/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) => {
	!roles.includes(req.user.role)
		? res.status(401).json({
			success: false,
			message: 'Acesso não autorizado',
		})
		: next();
};

const serializeUser = user => {
	return {
		role: user.role,
		username: user.username,
		email: user.email,
		picture: user.picture,
		name: user.name,
		_id: user._id,
		updatedAt: user.updatedAt,
		createdAt: user.createdAt
	};
};

module.exports = {
	passportAuth,
	checkRole,
	serializeUser
};
