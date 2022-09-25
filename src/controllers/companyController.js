const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;

const ROLES = require('../utils/constants');

const {
	generateToken,
	verifyToken,
	decodeToken
} = require('../utils/jwt');
const { serializeUser } = require('passport');

const loginCompany = async (req, res) => {
	const credentials = req.body;
  
	Company.findOne({ 'company.email' : credentials.email })
		.then(async (company) => {
			if (!company) {
				return res.status(404).json({
					success: false,
					message: 'Email ou senha incorretos.',
				});
			}

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

const registerCompany = async (req, res) => {
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

const updateCompanyData = async (req, res) => {
	try {
		let token = req.headers.authorization;
		let _id = ObjectId(decodeToken(token).user_id);

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
			'company.address': credentials.company.address
		}).then((company) => {
			if (!company) {
				return res.status(404).json({
					success: false,
					message: 'Empresa não encontrada',
				});
			}

			return res.status(201).json({
				success: true,
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

		let token = req.headers.authorization;
		let _id = ObjectId(decodeToken(token).user_id);

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

			return res.status(201).json({
				success: true,
				company,
			});
		});

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: err,
		});
	}
};

module.exports = {
	registerCompany,
	loginCompany,
	getCompanyData,
	updateCompanyData,
	updateHolderData
};