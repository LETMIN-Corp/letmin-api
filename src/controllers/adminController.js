const Admin = require("../models/Admin");
const Company = require("../models/Company")
const bcrypt = require("bcryptjs");
const ROLES = require('../utils/constants');

const {
    generateToken,
    verifyToken,
    decodeToken
} = require("../utils/jwt");

/**
 * @DESC To register the user (ADMIN, SUPER_ADMIN, USER)
 */
const adminRegister = async (req, res) => {
    const adminDets = req.body;
  
    // Check if email is already taken
    let admin = await Admin.findOne({ email: adminDets.email });
    if (admin) {
        return res.status(400).json({
            message: "Email já cadastrado",
            success: false
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
            message: `Parabens ${value.name}! Você está cadastrado. Por favor logue.`,
            success: true,
        });
    })
    .catch((err) => {
        return res.status(500).json({
            error: err,
            message: "Não foi possivel cadastrar sua conta.",
            success: false
        });
    })
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
            message: "Email não encontrado.",
            success: false
        });
    }
    // Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Senha incorreta.",
            success: false
        });
    }

    // Sign in the token and issue it to the user
    let token = generateToken(user, ROLES.ADMIN);
    let result = {
        name: user.name,
        email: user.email,
        token: token,
    };
    return res.header("Authorization", token).status(200).json({
        ...result,
        message: "Parabens! Você está logado.",
        success: true
    });
};

const getAllCompanies = async (req, res) => {
    
    Company.find().select('-holder.password')
    .then((companies) => {
        return res.status(200).json({
            message: "Lista de empresas",
            success: true,
            companies: companies
        });
    })
    .catch((err) => {
        return res.status(500).json({
            message: "Não foi possivel listar as empresas",
            success: false
        });
    });

};

const changeCompanyBlockStatus = async (req, res) => {
    const { company_id } = req.body;

    Company.findById( company_id , (err, company) => {
        if (err) {
            return res.status(500).json({
                message: "Não foi possivel bloquear a empresa",
                success: false
            });
        }
        let status = company.status.blocked;
        company.status.blocked = !status;
        company.save();
        return res.status(200).json({
            message: `Empresa ${company.status.blocked ? '': 'des'}bloqueada com sucesso`,
            success: true
        });
    })
};

module.exports = {
    adminRegister,
    adminLogin,
    getAllCompanies,
    changeCompanyBlockStatus,
}