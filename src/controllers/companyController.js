const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ROLES = require('../utils/constants');
const { CLIENT_URL } = require('../config');
const sendEmail = require('../utils/mailer');

const { generateToken } = require('../utils/jwt');
const { companySearchUsers } = require('./repositories/UserRepository');
const { Consola } = require('consola');
const Log = require('../models/Log');

/**
 * Login company
 * @route POST /company/login
 */
const loginCompany = async (req, res) => {
	const credentials = req.body;
  
	try {

		const company = await Company.findOne({
			'company.email' : credentials.email,
		}).select('+company.email +holder.password');

		if (!company) {
			return res.status(400).json({
				success: false,
				message: 'Email ou senha incorretos.',
			});
		}

		const isMatch = await bcrypt.compare(credentials.password, company.holder.password);

		if (!isMatch) {
			return res.status(400).json({
				success: false,
				message: 'Email ou senha incorretos.',
			});
		}

		if (company.status.blocked) {
			return res.status(401).json({
				success: false,
				message: 'Empresa bloqueada, entre em contato com o administrador.',
			});
		}

		await Company.findByIdAndUpdate(company._id, { $set: { lastLogin: Date.now() } });

		let token = generateToken(company, ROLES.COMPANY);

		return res.header('Authorization', token).status(200).json({
			success: true,
			message: 'Logado com sucesso.',
		});

	} catch (err) {
		Consola.error(err);

		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	}
};

/**
 * Register company
 * @route POST /company/register
 */
const registerCompany = async (req, res) => {
	let credentials = req.body;
  
	try {
		let company = await Company.findOne({
			'company.cnpj' : credentials.company.cnpj,
			'company.email' : credentials.company.email 
		}).select('+company.cnpj +company.email');

		if (company) {
			return res.status(400).json({
				success: false,
				message: 'CNPJ ou email já foi cadastrado.',
			});
		}
	
		credentials.holder.password = await bcrypt.hash(credentials.holder.password, 12);

		company = new Company(credentials);
	
		await company.save();

		let token = generateToken(company, ROLES.COMPANY);

		return res.header('Authorization', token).status(201).json({
			success: true,
			message: 'Parabéns! Você está cadastrado e logado.',
		});

	} catch (err) {
		Consola.error(err);

		Log.create({
			action: 'registerCompany',
			target: {},
			description: 'Erro ao cadastrar empresa: ' + err,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		});

		return res.status(400).json({
			success: false,
			message: 'Erro ao cadastrar empresa.',
		});
	}
};

/**
 * Get company data
 * @route GET /company/company-data
 */
const getCompanyData = async (req, res) => {
	const { _id } = req.user;

	await Company.findById({ _id }).select('-holder.password')
		.then((company) => {
			return res.status(200).json({
				success: true,
				message: 'Dados da empresa.',
				data: company,
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
 * Check the selector and token for password recovery
 * @route GET /company/check-selector-token
 * @param {string} selector
 * @param {string} token
 **/
const checkRecoveryToken = async (req, res, next) => {
	const { selector, token } = req.body;

	try {
		const company = await Company.findOne({ 'forgotPassword.selector': selector } );

		if (!company || !token) {
			return res.status(400).json({
				success: false,
				message: 'Token inválido.',
			});
		}

		// find forgotPassword object in company with the same selector
		const selectedFP = company.forgotPassword.find((fp) => fp.selector === selector);
		const tokenIsValid = await bcrypt.compare(token, selectedFP.token || '');

		if (
			!selectedFP || 
			!tokenIsValid || 
			selectedFP.createdAt < Date.now() - 3600000 ||
			selectedFP.used
		) {
			return res.status(400).json({
				success: false,
				message: 'Token inválido ou expirado.',
			});
		}

		req.company = company;
		next();

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	}
};

/**
 * Create forgot password token on company
 * @route POST /company/forgot-password
 * @body email
 * @returns token, selector
 **/
const createForgotPasswordToken = async (req, res) => {
	const { email } = req.body;

	const company = await Company.findOne({ 'company.email': email });

	if (!company) {
		return res.status(400).json({
			success: false,
			message: 'Email não cadastrado.',
		});
	}

	try {
		const ipRequest = req.socket.remoteAddress;
		const selector = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		const hashedToken = await bcrypt.hash(token, 12);

		const url = `${CLIENT_URL[0]}/company/new-password?selector=${selector}&token=${token}`;

		const linkemail = require('../utils/emailTemplates/forgotPassword')(company, url);

		await sendEmail(linkemail)
			.then(async (info, err) => {
				if (err) {
					return res.status(400).json({
						success: false,
						message: 'Error ' + err,
					});
				}

				let passwordReset = {
					selector: selector,
					token: hashedToken,
					ipRequest: ipRequest,
					createdAt: Date.now(),
					used: false
				};

				// Add passwordReset object to company.forgotPassword array
				Company.findByIdAndUpdate(company._id, {
					$push: {
						forgotPassword: passwordReset,
					},
				})
					.then(() => {
						return res.status(200).json({
							success: true,
							message: 'Email enviado com sucesso.',
						});
					})
					.catch((err) => {
						return res.status(400).json({
							success: false,
							message: 'Error ' + err,
						});
					});
			});
	} catch (err) {
		Consola.error(err);

		Log.create({
			action: 'createForgotPasswordToken',
			target: {},
			description: err,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		});

		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	}
};

/**
 * Search users by name
 * @route GET /company/user
 */
const searchUsers = async (req, res) => {
	let search = req.params.search || '';

	try{
		const users = await companySearchUsers(search);

		if (!users) {
			return res.status(404).json({
				success: false,
				message: 'Usuários não encontrados.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Usuários encontrados.',
			users: users,
		});

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	}
};

/**
 * Reset Password of company after passing through CheckRecoveryToken middleware
 * @route POST /company/reset-password
 * @body { password, confirmPassword }
 **/
const resetPassword = async (req, res) => {
	const { password } = req.body;
	const company = req.company;

	company.holder.password = await bcrypt.hash(password, 12);
	// and set the used field from passwordReset with the selector and token as false

	company.forgotPassword.forEach((fp) => {
		if (fp.selector === req.body.selector) {
			fp.used = true;
		}
	});

	await company.save();

	res.status(200).json({
		success: true,
		message: 'Senha alterada com sucesso.',
	});
};

/**
 * Update Company Data
 * @route Patch /api/company/update-company
 */
const updateCompanyData = async (req, res) => {
	try {
		const { _id } = req.user;

		let credentials = req.body;

		// check if email/cnpj is already in use by another company
		let company = await Company.findOne({
			'company.email' : credentials.company.email,
			'company.cnpj' : credentials.company.cnpj,
			_id: { $ne: _id }
		}).select('+company.email');

		if (company && company._id != _id) {
			return res.status(400).json({
				success: false,
				message: 'Email ou CNPJ já está em uso.',
			});
		}

		await Company.findByIdAndUpdate(_id, {
			'company.name': credentials.company.name,
			'company.cnpj': credentials.company.cnpj,
			'company.email': credentials.company.email,
			'company.phone': credentials.company.phone,
			'company.address': credentials.company.address,
			'company.description': credentials.company.description,
		}).then((company) => {
			if (!company) {
				return res.status(404).json({
					success: false,
					message: 'Empresa não encontrada',
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Empresa atualizada com sucesso.',
				company,
			});
		});

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao atualizar os dados da empresa.' + err,
		});
	}
};

const updateHolderData = async (req, res) => {
	try {
		const { _id } = req.user;

		let credentials = req.body;

		await Company.findByIdAndUpdate(_id, {
			'holder.name': credentials.holder.name,
			'holder.cpf': credentials.holder.cpf,
			'holder.email': credentials.holder.email,
			'holder.phone': credentials.holder.phone,
		}).then((company) => {
			if (!company) {
				return res.status(404).json({
					success: false,
					message: 'Empresa não encontrada',
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Dados do responsável atualizados com sucesso.',
				company,
			});
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao atualizar os dados do responsável.' + err,
		});
	}
};

const addToTalentBank = async (req, res) => {
	try {
		let companyId = req.user._id;
		let id = req.body.target;
		let company = await Company.findById(companyId);
	
		if(company.talentBank.includes(id)) {
			return res.status(400).json({
				message: 'O prestador de serviços já está em seu banco de talentos',
				success: false,
			});
		}

		company.talentBank.push(id);
		company.save().then(() => {
			return res.status(201).json({
				message: 'O prestador de serviços foi adicionado ao banco de talentos',
				success: true,
			});
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao adicionar o prestador de serviços ao banco de talentos.' + err,
		});
	}
};

const removeFromTalentBank = async (req, res) => {
	try {
		let companyId = req.user._id;
		let id = req.body.target;
		let company = await Company.findById(companyId);
	
		if(! company.talentBank.includes(id)) {
			return res.status(400).json({
				message: 'O prestador de serviços não está em seu banco de talentos',
				success: false,
			});
		}

		company.talentBank = company.talentBank.filter((userId) => {
			return userId != id;
		});

		company.save().then(() => {
			return res.status(200).json({
				message: 'O prestador de serviços foi removido de seu banco de talentos',
				success: true,
			});
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao remover o prestador de serviços: ' + err,
		});
	}
};

const getTalentBank = async (req, res) => {
	let { _id } = req.user;

	await Company.findById({ _id })
		.then((company) => {
			User.find().select('-password')
				.then((users) => {
					users = users.filter((user) => {
						return company.talentBank.includes(user._id);
					});

					return res.status(200).json({
						success: true,
						users: users,
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

const companyGetVacancy = async (req, res) => {
	
	const { companyGetVacancy } = require('./repositories/VacancyRepository');

	try {
		const vacancy = await companyGetVacancy(req.params.id);

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Vaga encontrada com sucesso',
			vacancy: vacancy,
		});

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vaga' + err,
		});
	}
};

const sendCandidateContactEmail = async (req, res) => {

	const { message, user_id } = req.body;

	if (!message, !user_id) {
		return res.status(400).json({
			success: false,
			message: 'Mensagens e usuário alvo são obrigatórias'
		});
	}

	const user = await User.findById(user_id).select('name email');

	if (!user) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao encontrar usuário'
		});
	}

	try {
		const contactEmail = require('../utils/emailTemplates/contactUser')(message, user);

		await sendEmail(contactEmail)
			.then(async (info, err) => {
				if (err) {
					return res.status(400).json({
						success: false,
						message: 'Error ' + err,
					});
				}

				return res.status(200).json({
					success: true,
					message: 'Sucesso no envio do email ao candidato',
				});
				
			});

	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Erro ao enviar email' + err
		});
	}
};

module.exports = {
	registerCompany,
	loginCompany,
	getCompanyData,
	searchUsers,
	updateCompanyData,
	updateHolderData,
	addToTalentBank,
	removeFromTalentBank,
	getTalentBank,
	createForgotPasswordToken,
	checkRecoveryToken,
	resetPassword,
	companyGetVacancy,
	sendCandidateContactEmail,
};