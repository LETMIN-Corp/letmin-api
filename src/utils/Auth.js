const passport = require('passport');
const multer = require('multer');
const multerConfig = require('../config/multer');

const { API_URL } = require('../config');
const User = require('../models/User');

var upload = multer(multerConfig).single('file')
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
		_id: user._id,
		role: user.role,
		name: user.name,
		email: user.email,
		picture: user.picture,
		updatedAt: user.updatedAt,
		createdAt: user.createdAt
	};
};

const changeProfilePicture = async (req, res) => {
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError || err) {
			return res.status(400).json({
				success: false,
				message: 'Erro no upload do arquivo: ' + err
			})
		}
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'Nenhum arquivo enviado'
			})
		}

		User.findByIdAndUpdate(req.user._id, { picture: `${API_URL}/api/uploads/${req.file.filename}` }, { new: true })
			.then(user => {
				res.status(200).json({
					success: true,
					message: 'Foto de perfil atualizada com sucesso',
					user: serializeUser(user)
				});
			})
			.catch(err => {
				res.status(500).json({
					success: false,
					message: 'Não foi possivel atualizar foto de perfil',
					error: err
				});
			});
	});

	// 	return res.status(200).json({
	// 		success: true,
	// 		uri: req.file.key,
	// 		message: 'Arquivo enviado com sucesso',
	// 		file: API_URL + '/api/uploads/' + req.file.filename
	// 	})
	// })
};

module.exports = {
	passportAuth,
	checkRole,
	serializeUser,
	changeProfilePicture,
};
