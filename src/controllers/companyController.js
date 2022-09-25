const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/User');
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

	await Company.findById({ _id })
		.then((company) => {
			let result = {
				company: {
					name: company.company.name,
					cnpj: company.company.cnpj,
					email: company.company.email,
					phone: company.company.phone,
					address: company.company.address,
				},
				holder: {
					name: company.holder.name,
					cpf: company.holder.cpf,
					email: company.holder.email,
					phone: company.holder.phone,
				},
				plan: {
					selected: company.plan.selected,
				},
				card: {
					type: company.card.type,
					number: company.card.number,
					code: company.card.code,
					expiration: company.card.expiration,
					owner: company.card.owner,
				},
			};

			return res.status(200).json({
				success: true,
				message: 'Dados da empresa.',
				data: result,
			});
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				message: 'Error ' + err,
			});
		});
};

const searchUsers = async (req, res) => {
	let search = req.params.search || '';

	User.find({
		$or: [
			{ 'user.name': { $regex: search, $options: 'i' } },
		]
	}).then((users) => {
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
	}).catch((err) => {
		return res.status(400).json({
			success: false,
			message: err,
		});
	});
};

module.exports = {
	registerCompany,
	loginCompany,
	getCompanyData,
	searchUsers,
};