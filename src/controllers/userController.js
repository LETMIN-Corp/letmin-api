const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { success, error } = require('consola');
const { USER } = require('../utils/constants');
const { SECRET } = require('../config');
const consola = require('consola');

const {
	generateToken,
	verifyGoogleToken,
} = require('../utils/jwt');
const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');
const Log = require('../models/Log');

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
						message: 'Usuário bloqueado, entre em contato com o administrador.',
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

				await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });
  
				return res.header('Authorization', token).status(200).json({
					success: true,
					message: 'Parabéns! Você está logado.',
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
  
			newUser.save(async (err, user) => {
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

				return res.header('Authorization', token).status(200).json({
					success: true,
					message: 'Parabéns! Você está logado.',
				});
			});
		})
		.catch((err) => {
			consola.error(err);
			return res.status(400).json({
				success: false,
				message: 'Erro ao logar usuário',
			});
		});
};

/**
 * Get user data by id on token
 * @route GET /user/get-user
 */
const getUserData = async (req, res) => {
	try {
		const { id } = req.user;

		const user = await User.findById(id).select('-password -blocked -__v');

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

	} catch (err) {
		consola.error(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar usuário',
		});
	}
};

/**
 * Get all companies to show to the user
 * @route GET /user/company
 */
const searchCompany = async (req, res) => {
	try {
		let companies = await Company.aggregate([
			{
				$project: {
					_id: 1,
					name: '$company.name',
					address: '$company.address',
					description: '$company.description',
					// company: {
					// 	name: 1,
					// 	address: 1,
					// 	description: 1
					// }
				}
			},
			{
				$sort: {
					createdAt: -1
				}
			}
		]);

		if (!companies) {
			return res.status(404).json({
				success: false,
				message: 'Empresa não encontrada.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Empresas encontradas.',
			companies: companies
		});

	} catch (err) {
		consola.error(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar empresa',
		});
	}		
};

/**
 * Get company data receiving the id
 * @route GET /user/get-company/:id
 * @param {string} id
 */
const getCompany = async (req, res) => {
	try {

		let company = await Company.findById(req.params.id).populate('vacancies', 'role sector region description currency salary closed', { 
				$and: [
					{ closed: false },
				],
			}).select('company holder vacancies');

		if (!company) {
			return res.status(404).json({
				success: false,
				message: 'Empresa não encontrada.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Dados da empresa.',
			data: company,
		});

	} catch (err) {
		consola.error(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar dados da empresa',
		});
	}
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
			consola.error(err);
			return res.status(400).json({
				message: 'Erro ao atualizar os dados do usuário.',
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

		// Log action on database
		await Log.create({
			action: 'delete',
			target: {
				foreignKey: _id,
				role: 'User',
			},
			description: 'Usuário deletou sua conta.',
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		});

		return res.status(200).json({
			success: true,
			message: 'Usuário deletado com sucesso!',
		});

	} catch (err) {
		await Log.create({
			action: 'error',
			target: {
				foreignKey: _id,
				role: 'User',
			},
			description: 'Erro ao deletar usuário: ' + err,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		});

		return res.status(400).json({
			success: false,
			message: 'Erro ao deletar usuário.',
		});
	}
};

module.exports = {
	userLogin,
	getUserData,
	updateUser,
	deleteUserAccount,
	searchCompany,
	getCompany,
};
