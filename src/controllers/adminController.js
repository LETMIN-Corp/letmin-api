const Admin = require("../models/Admin");
const Company = require("../models/Company")
const bcrypt = require("bcryptjs");
const ROLES = require('../utils/constants');
const ObjectId = require('mongoose').Types.ObjectId;

const {
    generateToken,
    verifyToken,
    decodeToken
} = require("../utils/jwt");
const User = require("../models/User");

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

    if(!company_id) {
        return res.status(400).json({
            message: "ID da empresa não informado",
            success: false
        });
    }

    let _id = ObjectId(company_id);

    Company.findById( _id , (err, company) => {
        if (err) {
            return res.status(500).json({
                message: "Não foi possivel encontrar a empresa",
                success: false
            });
        }
        if (company) {
            console.log(company);
            company.status.blocked = !company.status.blocked;
            company.save().then(async (value) => {
                let message = value.status.blocked ? "bloqueada" : "desbloqueada";

                let updatedCompanies = await Company.find().select('-holder.password');

                return res.status(200).json({
                    message: `Empresa ${message} com sucesso`,
                    success: true,
                    companies: updatedCompanies
                });
            });
        }
    });
};

const getAllUsers = async (req, res) => {
    User.find().select('-password')
    .then((users) => {
        return res.status(200).json({
            message: "Lista de usuários",
            success: true,
            users: users
        });
    })
};

const changeUserBlockStatus = async (req, res) => {
    const { user_id } = req.body;

    if(!user_id) {
        return res.status(400).json({
            message: "ID do usuário não informado",
            success: false
        });
    }

    let _id = ObjectId(user_id);

    User.findById( _id , (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Não foi possivel encontrar o usuário",
                success: false
            });
        }
        user.blocked = !user.blocked;
        user.save().then(async (value) => {
            let message = value.blocked ? "bloqueado" : "desbloqueado";

            let updatedUsers = await User.find().select('-password');

            return res.status(200).json({
                message: `Usuário ${message} com sucesso`,
                success: true,
                users: updatedUsers
            });
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
}