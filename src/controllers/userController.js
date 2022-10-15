const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { success, error } = require('consola');
const { USER } = require('../utils/constants');
const { SECRET } = require('../config');

const {
	generateToken,
	verifyGoogleToken,
} = require('../utils/jwt');
const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');

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
					success({
						message: `Email enviado para ${user.email}`,
						badge: true
					});
				}).catch((err) => {
					error({
						message: `Erro ao enviar email para ${user.email}: ${err}`,
						badge: true
					});
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

	User.findById(id).select('-password -blocked -__v')
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
 * @route POST /user/update-user
*/
const updateUser = async (req, res) => {
	const { _id } = req.user;

	User.findByIdAndUpdate(_id, req.body, { new: true }).then((user) => {
		if (!user) {
			return res.status(400).json({
				message: 'Usuário não encontrado.',
				success: false
			});
		}
		return res.status(200).json({
			message: 'Os dados do usuário foram atualizados com sucesso!',
			success: true,
			user,
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
 * Delete User account - Only user
 * @route DELETE /user/delete-account
*/
const deleteUserAccount = async (req, res) => {
	const { _id } = req.user;

	try {
		await User.findByIdAndDelete(_id).then((user) => {
			if (!user) {
				return res.status(400).json({
					success: false,
					message: 'Usuário não encontrado.',
				});
			}
		});

		// remove user _id from Vacancy candidates array
		await Vacancy.updateMany(
			{ candidates: { $in: [_id] } },
			{ $pull: { candidates: _id } },
			{ multi: true }
		);

		// Remove user _id from Company talentBank array	
		await Company.updateMany(
			{ talentBank: { $in: [_id] } },
			{ $pull: { talentBank: _id } },
			{ multi: true }
		);

		return res.status(200).json({
			success: true,
			message: 'Usuário deletado com sucesso!',
		});

	} catch (err) {
		console.log(err);
		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	}
};

module.exports = {
	userLogin,
	getUserData,
	updateUser,
	deleteUserAccount,
};
