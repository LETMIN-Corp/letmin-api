const Admin = require('../models/Admin');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const { ADMIN } = require('../utils/constants');
const ObjectId = require('mongoose').Types.ObjectId;
const { success, error } = require('consola');

const {
	generateToken,
} = require('../utils/jwt');
const User = require('../models/User');
const Complaints = require('../models/Complaint');
const Log = require('../models/Log');

/**
 * @DESC To register the admin
 */
const adminRegister = async (req, res) => {
	const adminDets = req.body;

	// Check if email is already taken
	let admin = await Admin.findOne({ email: adminDets.email });
	if (admin) {
		return res.status(400).json({
			success: false,
			message: 'Email já cadastrado',
		});
	}

	// Get the hashed password
	const password = await bcrypt.hash(adminDets.password, 12);
	// create a new user
	const newAdmin = new Admin({
		name: adminDets.name,
		email: adminDets.email,
		password: password
	});
	await newAdmin.save()
		.then((value) => {
			success('Admin criado com sucesso');
			return res.status(201).json({
				success: true,
				message: `Parabéns ${value.name}! Você está cadastrado. Por favor logue.`,
			});
		})
		.catch((err) => {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel cadastrar sua conta.',
				error: err,
			});
		});
};

/**
 * @DESC To Login the user
 * @PATH POST /api/auth/login-user
 * @ACCESS Public
 */
const adminLogin = async (req, res) => {
	try {
		let { email, password } = req.body;
		
		// First Check if the email is in the database
		let user = await Admin.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Email não encontrado.',
			});
		}
		// Now check for the password
		let isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				success: false,
				message: 'Senha incorreta.',
			});
		}

		await Admin.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

		// Sign in the token and issue it to the user
		let token = generateToken(user, ADMIN);

		return res.header('Authorization', token).status(200).json({
			success: true,
			message: 'Parabéns! Você está logado.',
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Não foi possivel logar.',
			error: err,
		});
	}
};

const getAllCompanies = async (req, res) => {
	try {
		const companies = await Company.find().select('-holder.password');

		return res.json({
			success: true,
			message: 'Empresas encontradas com sucesso',
			companies,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Não foi possivel encontrar as empresas.',
			error: err,
		});
	}
};

const changeCompanyBlockStatus = async (req, res) => {
	try {
		const { company_id } = req.body;

		if(!company_id) {
			return res.status(400).json({
				success: false,
				message: 'ID da empresa não informado',
			});
		}

		let _id = ObjectId(company_id);

		Company.findById( _id , (err, company) => {
			if (!company || err) {
				return res.status(500).json({
					success: false,
					message: 'Não foi possivel encontrar a empresa',
				});
			}
			company.status.blocked = !company.status.blocked;
			company.save().then(async (value) => {
				let message = value.status.blocked ? 'bloqueada' : 'desbloqueada';

				let updatedCompanies = await Company.find().select('-holder.password');

				return res.status(200).json({
					success: true,
					message: `Empresa ${message} com sucesso`,
					companies: updatedCompanies
				});
			});
		});

	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Erro ao alterar status da empresa',
			error: err,
		});
	}
};

const getAllUsers = async (req, res) => {
	User.find().select('-password')
		.then((users) => {
			return res.status(200).json({
				success: true,
				message: 'Lista de usuários',
				users: users
			});
		});
};

const changeUserBlockStatus = async (req, res) => {
	const { user_id } = req.body;

	if(!user_id) {
		return res.status(400).json({
			success: false,
			message: 'ID do usuário não informado',
		});
	}

	let _id = ObjectId(user_id);

	User.findById( _id , (err, user) => {
		if (err || !user) {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel encontrar o usuário',
			});
		}
		user.blocked = !user.blocked;
		user.save().then(async (value) => {
			let message = value.blocked ? 'bloqueado' : 'desbloqueado';

			let updatedUsers = await User.find().select('-password');

			return res.status(200).json({
				success: true,
				message: `Usuário ${message} com sucesso`,
				users: updatedUsers
			});
		});
	});
};

const getAllComplaints = async (req, res) => {
	const { getAllComplaintsWithUsers } = require('./repositories/ComplaintRepository');

	try {
		const complaints = await getAllComplaintsWithUsers();

		return res.json({
			success: true,
			message: 'Reclamações encontradas com sucesso',
			complaints,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar reclamações' + err,
		});
	}
};

const changeComplaintStatus = async (req, res) => {
	const { complaint_id } = req.body;

	if(!complaint_id) {
		return res.status(400).json({
			success: false,
			message: 'ID da denúncia não informado',
		});
	}
	try {
		let _id = ObjectId(complaint_id);
		
		Complaints.findById( _id , (err, complaint) => {
			if (err || !complaint) {
				return res.status(500).json({
					success: false,
					message: 'Não foi possivel encontrar a denúncia',
				});
			}
			complaint.pending = !complaint.pending;
			complaint.save().then(async (value) => {
				let message = value.pending ? 'Resolvida' : 'Pendente';
	
				let updatedComplaints = await Complaints.find();
	
				return res.status(200).json({
					success: true,
					message: `Denúncia marcada como ${message} com sucesso`,
					complaints: updatedComplaints
				});
			});
		});
	} catch (err) {
		error(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar reclamações' + err,
		});
	}
};

const removeComplaint = async (req, res) => {
	const { complaint_id } = req.body;

	if(!complaint_id) {
		return res.status(400).json({
			success: false,
			message: 'ID da denúncia não informado',
		});
	}
	try {
		let _id = ObjectId(complaint_id);
		
		Complaints.findByIdAndDelete( _id , (err, complaint) => {
			if (err || !complaint) {
				return res.status(500).json({
					success: false,
					message: 'Não foi possivel encontrar a denúncia',
				});
			}
			return res.status(200).json({
				success: true,
				message: 'Denúncia removida com sucesso',
			});
		});
	} catch (err) {
		error(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar reclamações' + err,
		});
	}
};

const getUser = async (req, res) => {
	const { user_id } = req.body;

	if(!user_id) {
		return res.status(400).json({
			success: false,
			message: 'ID do usuário não informado',
		});
	}

	let _id = ObjectId(user_id);

	User.findById( _id ).select('-password')
		.then((user) => {
			return res.status(200).json({
				success: true,
				message: 'Usuário encontrado com sucesso',
				user: user
			});
		});
};

const getAllLogs = async (req, res) => {
	try {
		const logs = await Log.find();

		return res.json({
			success: true,
			message: 'Logs encontrados com sucesso',
			logs,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar logs' + err,
		});
	}
};

const cleanLogs = async (req, res) => {
	try {
		await Log.deleteMany();

		return res.json({
			success: true,
			message: 'Logs limpos com sucesso',
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao limpar logs' + err,
		});
	}
};

const getCompany = async (req, res) => {

	const { company_id } = req.body;

	await Company.findById(company_id).populate('vacancies', 'role sector region description currency salary closed', { 
		$and: [
			{ closed: false },
		],
	}).select('company holder vacancies')
		.then((company) => {
			return res.status(200).json({
				success: true,
				message: 'Dados da empresa.',
				company: company,
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
	adminRegister,
	adminLogin,
	getAllCompanies,
	changeCompanyBlockStatus,
	getAllUsers,
	changeUserBlockStatus,
	getAllComplaints,
	changeComplaintStatus,
	removeComplaint,
	getUser,
	getAllLogs,
	cleanLogs,
	getCompany,
};