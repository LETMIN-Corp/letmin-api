const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/User');
const ROLES = require('../utils/constants');

const {
	generateToken,
	decodeToken
} = require('../utils/jwt');

/**
 * Login company
 * @route POST /company/login
 */
const loginCompany = async (req, res) => {
	const credentials = req.body;
  
	Company.findOne({ 'company.email' : credentials.email }).select('-company.holder.password')
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

			return res.header('Authorization', token).status(200).json({
				success: true,
				message: 'Parabéns! Você está logado.',
				token: token,
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
 * Register company
 * @route POST /company/register
 */
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

			return res.header('Authorization', token).status(201).json({
				success: true,
				message: 'Parabéns! Você está cadastrado e logado.',
				token: token,
			});
		}).catch(err => {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel cadastrar a empresa.',
				error: err,
			});
		});
};

/**
 * Get company data
 * @route GET /company/company-data
 */
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

/**
 * Search users by name
 * @route GET /company/user
 */
const searchUsers = async (req, res) => {
	let search = req.params.search || '';

	User.find({
		$and: [
			{ blocked: false },
			{
				$or: [
					{ 'user.name': { $regex: search, $options: 'i' } },
				]
			}
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
	let token = req.headers.authorization;

	let _id = ObjectId(decodeToken(token).user_id);

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
};