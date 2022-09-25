const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;

const ROLES = require('../utils/constants');
const { CLIENT_URL } = require('../config');

const {
	generateToken,
	decodeToken
} = require('../utils/jwt');
const { serializeUser } = require('passport');

const loginCompany = async (req, res) => {
	const credentials = req.body;
  
	Company.findOne({ 'company.email' : credentials.email })
		.then(async (company) => {

			if (company.status.blocked) {
				return res.status(401).json({
					success: false,
					message: 'Empresa bloqueada, entre em contato com o adminsitrador.',
				});
			}

			let isMatch = await bcrypt.compare(credentials.password, company.holder.password);

			if(!isMatch){
				return res.status(400).json({
					success: false,
					message: 'Credenciais incorretas',
				});
			}
			let token = generateToken(company, ROLES.COMPANY);

			let result = {
				company: {
					name: company.company.name,
					email: company.company.email,
				},
				holder: {
					name: company.holder.name,
					email: company.holder.email,
					phone: company.holder.phone,
				},
				token: token,
			};
			return res.header('Authorization', token).status(200).json({
				success: true,
				message: 'Parabens! Você está logado.',
				...result,
			});
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				message: 'Error ' + err,
			});
		});
};

const registerCompany = async (req, res, next) => {
	let credentials = req.body;
  
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
  
	company = new Company({
		...credentials,
		role: ROLES.COMPANY,
	});
  
	company.save()
		.then(company => {
  
			let token = generateToken(company, ROLES.COMPANY);
			let result = {
				company: {
					name: company.company.name,
					email: company.company.email,
				},
				holder: {
					name: company.holder.name,
					email: company.holder.email,
					phone: company.holder.phone,
				},
				token: token,
			};
			return res.header('Authorization', token).status(201).json({
				...result,
				message: 'Parabens! Você está cadastrado e logado.',
				success: true
			});
		}).catch(err => {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel cadastrar a empresa.',
				error: err,
			});
		});
};

const getCompanyData = async (req, res) => {
	let token = req.headers.authorization;

	let _id = ObjectId(decodeToken(token).user_id);

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

const sendEmail = require('../utils/mailer');

const createForgotPasswordToken = async (req, res) => {
	const { email } = req.body;

	const company = await Company.findOne({ 'company.email': email });

	if (!company) {
		return res.status(400).json({
			success: false,
			message: 'Email não cadastrado.',
		});
	}

	const ipRequest = req.socket.remoteAddress;
	const selector = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	const hashedToken = await bcrypt.hash(token, 12);

	const url = `${CLIENT_URL}/new-password?selector=${selector}&validator=${token}`;

	const linkemail = require('../utils/emailTemplates/forgotPassword')(company, url);

	await sendEmail(linkemail)
	.then(async (err, info) => {
		if(err) {
			res.status(500).json({
				success: false,
				message: 'Erro ao enviar email',
				error: err,
			});
		}

		Company.findByIdAndUpdate(company._id, {
			'forgotPassword.selector': selector,
			'forgotPassword.token': hashedToken,
			'forgotPassword.issuedAt': Date.now(),
			'forgotPassword.ip': ipRequest,
		}, { new: true })
			.then((company) => {
				return res.status(200).json({
					success: true,
					message: 'Email enviado com sucesso.',
				});
			})
			
	})
	.catch((err) => {
		return res.status(400).json({
			success: false,
			message: 'Error ' + err,
		});
	});
};

const checkToken = async (req, res) => {
	const { selector, token } = req.params;

	const company = await Company.findOne({ 'forgotPassword.token': selector });
	const tokenIsValid = await bcrypt.compare(token, company.forgotPassword.token);

	if (!company || !tokenIsValid) {
		return res.status(400).json({
			success: false,
			message: 'Token inválido.',
		});
	}

	return res.status(200).json({
		success: true,
		message: 'Token válido.',
	});
};

const resetPassword = async (req, res) => {
	const { selector, token } = req.params;

	const company = await Company.findOne({ 'forgotPassword.token': selector });
	const tokenIsValid = await bcrypt.compare(token, company.forgotPassword.token);

	if (!company || !tokenIsValid) {
		return res.status(400).json({
			success: false,
			message: 'Token inválido.',
		});
	}

	company.holder.password = await bcrypt.hash(password, 12);

	await company.save();

	res.status(200).json({
		success: true,
		message: 'Senha alterada com sucesso.',
	});
};

module.exports = {
	registerCompany,
	loginCompany,
	getCompanyData,
	checkToken,
	createForgotPasswordToken,
	resetPassword,
};