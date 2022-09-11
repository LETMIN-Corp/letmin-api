const Admin = require("../models/Admin");
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
            message: `Parabéns ${value.name}! Você está cadastrado. Por favor logue.`,
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
        return res.status(403).json({
            message: "Credenciais incorretas.",
            success: false
        });
    }
  
    // Sign in the token and issue it to the user
    let token = generateToken(user, ROLES.ADMIN);
    let result = {
        username: user.username,
        email: user.email,
        token: token,
    };
    return res.header("Authorization", token).status(200).json({
        ...result,
        message: "Parabéns! Você está logado.",
        success: true
    });
};

module.exports = {
    adminRegister,
    adminLogin
}