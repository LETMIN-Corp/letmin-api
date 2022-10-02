const Company = require("../models/Company");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

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
                message: 'Você não pode criar uma reclamação contra você mesmo',
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
            envoy,
            pending: true,
            // capitalize the first letter of the roles types
            envoyType: envoyRole.charAt(0).toUpperCase() + envoyRole.slice(1),
            targetType: targetRole,
        });

        await newComplaint.save();

        return res.status(201).json({
            success: true,
            message: 'Reclamação criada com sucesso',
            newComplaint,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Erro ao criar reclamação: ' + err,
        });
    }
}

module.exports = {
    createComplaint,
};