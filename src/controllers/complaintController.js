const Company = require('../models/Company');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

/**
 * Create a complaint against a user or company
 * @route POST api/create-complaint
 */
const createComplaint = async (req, res) => {
	try {
		let envoy = req.user._id;
		let envoyRole = req.user.role;
		let target = req.body.target;

		// Check if the user is trying to create a complaint against himself
		if (envoy == target) {
			return res.status(400).json({
				success: false,
				message: 'Você não pode criar uma denúncia contra você mesmo',
			});
		}

		// Check if the target user exists (it can be a company or a user)
		const user = await User.findById(target);
		const company = await Company.findById(target);

		if (!user && !company) {
			return res.status(400).json({
				success: false,
				message: 'Usuário não encontrado',
			});
		}

		let targetRole = user ? 'User' : 'Company';

		// Check if fields are empty
		if (!req.body.reason || !req.body.description) {
			return res.status(400).json({
				success: false,
				message: 'Preencha todos os campos',
			});
		}
        
		// Create the complaint
		const newComplaint = new Complaint({
			...req.body,
			envoy: {
				foreignKey: envoy,
				role: envoyRole.charAt(0).toUpperCase() + envoyRole.slice(1)
			},
			target: {
				foreignKey: target,
				role: targetRole
			},
			pending: true,
		});

		await newComplaint.save();

		return res.status(201).json({
			success: true,
			message: 'Denúncia criada com sucesso',
			newComplaint,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao criar denúncia: ' + err,
		});
	}
};

module.exports = {
	createComplaint,
};