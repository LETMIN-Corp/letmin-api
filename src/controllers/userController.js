const User = require('../models/User');
const { USER } = require('../utils/constants');
const bcrypt = require('bcryptjs');

const { SECRET } = require('../config');

const {
	generateToken,
	verifyGoogleToken,
} = require('../utils/jwt');

/**
 * User Login/Registration via Google
 * @route POST /api/auth/google
 */
const userLogin = async (req, res) => {
	if (!req.body.credential) {
		return res.status(400).json({
			success: false,
			message: 'O Token é obrigatório.'
		});
	}
  
	let payload;

	try {
		payload = await verifyGoogleToken(res, req.body.credential);

		if (!payload || !payload.email_verified) {
			return res.status(400).json({
				success: false,
				message: 'Email google não verificado.'
			});
		}

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Token usado muito tarde ou inválido. Verifique sua conexão e horário'
		});
	}

	const { sub, name, email, picture } = payload;
  
	User.findOne({ email })
		.then( async (user) => {
			// User already exists
			if (user) {
				if (user.blocked) {
					return res.status(401).json({
						success: false,
						message: 'Usuário bloqueado, entre em contato com o adminsitrador.',
					});
				}

				let isMatch = await bcrypt.compare(sub + SECRET, user.password);
				if (!isMatch) {
					return res.status(400).json({
						success: false,
						message: 'Credenciais incorretas',
					});
				}

				const token = generateToken(user, USER);
  
				let result = {
					username: user.username,
					role: user.role,
					picture: user.picture,
					email: user.email,
					token: token,
				};
				return res.header('Authorization', token).status(200).json({
					success: true,
					message: 'Parabéns! Você está logado.',
					...result,
				});
			}
			// User does not exist
			let hashedpassword = await bcrypt.hash(sub + SECRET, 12);
			const newUser = new User({
				username: email.split('@')[0],
				email,
				password: hashedpassword,
				name,
				picture
			});
  
			newUser.save((err, user) => {
				const token = generateToken(user, USER);
  
				const sendMail = require('../utils/mailer');
				const email = require('../utils/emailTemplates/userRegister')(user);

				sendMail(email).then(() => {
					console.log('Email enviado com sucesso');
				}).catch((err) => {
					console.log('Erro ao enviar email', err);
				});

				let result = {
					username: user.username,  
					role: USER,
					email: user.email,
					token: token,
				};
				return res.header('Authorization', result.token).status(200).json({
					...result,
					message: 'Parabéns! Você está logado.',
					success: true
				});
			});
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				message: 'Error ' + err,
			});
		});
};

/**
 * Get user by id (On JWT)
 * @route GET /user/get-user
 */
const getUserData = async (req, res) => {
	const { id } = req.user;

	User.findById(id).select('-password')
		.then((user) => {
			if (!user) {
				return res.status(400).json({
					message: 'Usuário não encontrado.',
					success: false
				});
			}
			return res.status(200).json({
				user,
				success: true
			});
		})
		.catch((err) => {
			return res.status(400).json({
				message: 'Error ' + err,
				success: false
			});
		});
};

/**
 * Update user data
 * @route *** /user/update-user
*/
const updateUser = async (req, res) => {
	const { id } = req.params;

	User.findByIdAndUpdate(id, req.body, { new: true })
		.then((user) => {
			if (!user) {
				return res.status(400).json({
					message: 'Usuário não encontrado.',
					success: false
				});
			}
			return res.status(200).json({
				user,
				success: true
			});
		})
		.catch((err) => {
			return res.status(400).json({
				message: 'Error ' + err,
				success: false
			});
		});
};

module.exports = {
	userLogin,
	getUserData,
	updateUser,
};
