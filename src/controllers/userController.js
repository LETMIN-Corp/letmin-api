const User = require("../models/User");
const ROLES = require("../utils/constants");
const bcrypt = require("bcryptjs");

const { SECRET } = require("../config");

const {
    generateToken,
    verifyGoogleToken,
    verifyToken,
    decodeToken
} = require("../utils/jwt");

const userLogin = async (req, res, next) => {
    if (!req.body.credential) {
      return res.status(400).json({
        message: "O Token é obrigatório."
      });
    }
  
    let payload = await verifyGoogleToken(res, req.body.credential);
    const { sub, name, email, email_verified, picture } = payload;
  
    if (!payload || !email_verified) {
      return res.status(400).json({
        message: "Email google não verificado."
      });
    }
  
    User.findOne({ email })
    .then( async (user) => {
      // User already exists
      if (user) {
        if (user.blocked) {
          return res.status(401).json({
            message: "Usuário bloqueado, entre em contato com o adminsitrador.",
            success: false
          });
        }

        const token = generateToken(user, ROLES.USER);
  
        let result = {
          username: user.username,
          role: user.role,
          picture: user.picture,
          email: user.email,
          token: token,
        };
        return res.header("Authorization", token).status(200).json({
          ...result,
          message: "Parabéns! Você está logado.",
          success: true
        });
      }
      // User does not exist
      let hashedpassword = await bcrypt.hash(email + SECRET, 12);
      const newUser = new User({
        username: email.split("@")[0],
        email,
        password: hashedpassword,
        name,
        picture,
      });
  
      newUser.save((err, user) => {
        const token = generateToken(user, ROLES.USER);
  
        let result = {
          username: user.username,  
          role: 'user',
          picture: user.picture,
          email: user.email,
          token: token,
        };
        return res.header("Authorization", result.token).status(200).json({
          ...result,
          message: "Parabéns! Você está logado.",
          success: true
        });
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: 'Error ' + err,
        success: false
      });
    });
}

module.exports = {
    userLogin,
}