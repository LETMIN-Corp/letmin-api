const Admin = require('../models/Admin');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const { ADMIN } = require('../utils/constants');
const ObjectId = require('mongoose').Types.ObjectId;

const {
	generateToken,
} = require('../utils/jwt');
const User = require('../models/User');
const Complaints = require('../models/Complaint');

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

	// Sign in the token and issue it to the user
	let token = generateToken(user, ADMIN);
	let result = {
		name: user.name,
		email: user.email,
		token: token,
	};
	return res.header('Authorization', token).status(200).json({
		success: true,
		message: 'Parabéns! Você está logado.',
		...result,
	});
};

const getAllCompanies = async (req, res) => {
    
	Company.find().select('-holder.password')
		.then((companies) => {
			return res.status(200).json({
				success: true,
				message: 'Lista de empresas',
				companies: companies
			});
		})
		.catch((err) => {
			return res.status(500).json({
				success: false,
				message: 'Não foi possivel listar as empresas' + err,
			});
		});

};

const changeCompanyBlockStatus = async (req, res) => {

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
    try {
		// Get all complaints populating the target user/company and the envoy of the complaint
		// If it's a company convert 'company.name' to 'name'
        const complaints = await Complaints.aggregate([
			// Envoy
			{
				$lookup: {
					from: 'users',
					localField: 'envoy.foreignKey',
					foreignField: '_id',
					as: 'envoy.user'
				}
			},
			{
				$lookup: {
					from: 'companies',
					localField: 'envoy.foreignKey',
					foreignField: '_id',
					as: 'envoy.company'
				}
			},
			{
				$lookup: {
					from: 'admins',
					localField: 'envoy.foreignKey',
					foreignField: '_id',
					as: 'envoy.user'
				}
			},
			// Target
			{
				$lookup: {
					from: 'users',
					localField: 'target.foreignKey',
					foreignField: '_id',
					as: 'target.user'
				}
			},
			{
				$lookup: {
					from: 'companies',
					localField: 'target.foreignKey',
					foreignField: '_id',
					as: 'target.company'
				}
			},
			// Project
			{
				$project: {
					_id: 1,
					envoy: {
						$cond: {
							if: { $eq: [ "$envoy.user", [] ] },
							then: {
								$let: {
									vars: {
										company: { $arrayElemAt: [ "$envoy.company", 0 ] },
									},
									in: {
										_id: "$$company._id",
										name: "$$company.company.name",
										email: "$$company.company.email",
									}
								}
							},
							else: {
								$let: {
									vars: {
										user: { $arrayElemAt: [ "$envoy.user", 0 ] },
									},
									in: {
										_id: "$$user._id",
										name: "$$user.name",
										email: "$$user.email",
									}
								}
							}
						}
					},
					target: {
						$cond: {
							if: { $eq: [ "$target.user", [] ] },
							then: {
								$let: {
									vars: {
										company: { $arrayElemAt: [ "$target.company", 0 ] },
									},
									in: {
										_id: "$$company._id",
										name: "$$company.company.name",
										email: "$$company.company.email",
										role: "$$company.company.role",
									}
								}
							},
							else: {
								$let: {
									vars: {
										user: { $arrayElemAt: [ "$target.user", 0 ] },
									},
									in: {
										_id: "$$user._id",
										name: "$$user.name",
										email: "$$user.email",
									}
								}
							}
						}
					},
					reason: 1,
					description: 1,
					pending: 1,
					createdAt: 1,
					updatedAt: 1
				}
			}
		]);

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
}

const changeComplaintStatus = async (req, res) => {
	const { complaint_id } = req.body

	if(!complaint_id) {
		return res.status(400).json({
			success: false,
			message: 'ID da reclamação não informado',
		});
	}
	try {
		let _id = ObjectId(complaint_id);
		
		Complaints.findById( _id , (err, complaint) => {
			if (err || !complaint) {
				return res.status(500).json({
					success: false,
					message: 'Não foi possivel encontrar a reclamação',
				});
			}
			complaint.pending = !complaint.pending;
			complaint.save().then(async (value) => {
				let message = value.pending ? 'Resolvida' : 'Pendente';
	
				let updatedComplaints = await Complaints.find();
	
				return res.status(200).json({
					success: true,
					message: `Reclamação marcada como ${message} com sucesso`,
					complaints: updatedComplaints
				});
			});
		});
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar reclamações' + err,
		});
	}
};

const removeComplaint = async (req, res) => {
	const { complaint_id } = req.body

	if(!complaint_id) {
		return res.status(400).json({
			success: false,
			message: 'ID da reclamação não informado',
		});
	}
	try {
		let _id = ObjectId(complaint_id);
		
		Complaints.findByIdAndDelete( _id , (err, complaint) => {
			if (err || !complaint) {
				return res.status(500).json({
					success: false,
					message: 'Não foi possivel encontrar a reclamação',
				});
			}
			return res.status(200).json({
				success: true,
				message: `Reclamação removida com sucesso`,
			});
		});
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar reclamações' + err,
		});
	}
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
};