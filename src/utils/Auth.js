const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Company = require("../models/Company");

const { SECRET } = require("../config");
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const { companyValidator, companyLoginSchema } = require("../validate/company");
const adminValidator = require("../validate/admin");
const userValidator = require("../validate/user");
const formatError = require("./formatError"); 

const {
  generateToken,
  verifyToken,
  decodeToken
} = require("../utils/jwt");

/**
 * @DESC To register the user (ADMIN, SUPER_ADMIN, USER)
 */
const adminRegister = async (adminDets, res) => {
  const validation = adminValidator.validate(adminDets);

  if (validation.error) {
    return res.status(400).json({
      message: formatError(validation.error),
      success: false
    });
  }

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
    email: adminDets.email,
    password,
  });

  await newAdmin.save()
  .then((value) => {
    return res.status(201).json({
      message: "Parabens! Você está logado. Por favor logue.",
      success: true
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

const companyLogin = async (credentials, res) => {
  validation = companyLoginSchema.validate(credentials);

  if (validation.error) {
    return res.status(400).json({
      message: formatError(validation.error),
      success: false
    });
  }

  let email = credentials.email

  Company.findOne({ company_email: email })
  .then(async (company) => {
    let isMatch = await bcrypt.compare(credentials.password, company.holder_password);
    isMatch = (credentials.password == company.holder_password)
    console.log(company);
    if(!isMatch){
      return res.status(400).json({
        message: 'Credenciais incorretas',
        success: false
      });
    }
    let token = generateToken(company);

    let result = {
      company_name: company.company_name,
      company_email: company.company_email,
      holder_name: company.holder_name,
      holder_email: company.holder_email,
      holder_phone: company.holder_phone,
      token: token,
    };
    return res.header("Authorization", token).status(200).json({
      ...result,
      message: "Parabens! Você está logado.",
      success: true
    });
  })
  .catch((err) => {
    return res.status(400).json({
      message: 'Error ' + err,
      success: false
    });
  })
}

/**
 * @DESC To Login the user
 * @PATH POST /api/auth/login-user
 * @ACCESS Public
 */
const adminLogin = async (userCreds, res) => {

  let validation = adminValidator.validate(userCreds);

  if (validation.error) {
    return res.status(400).json({
      message: formatError(validation.error),
      success: false
    });
  }
 
  let { email, password } = userCreds;
  
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
  let token = generateToken(user);

  let result = {
    username: user.username,
    role: user.role,
    email: user.email,
    token: token,
  };
  return res.header("Authorization", token).status(200).json({
    ...result,
    message: "Parabens! Você está logado.",
    success: true
  });
};

/**
 * @DESC Passport middleware
 */
const userAuth = (req, res, next) => {
  passport.authenticate('local-login', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: err,
        message: "Unable to authenticate user.",
        success: false
      });
    }
    if (!user) {
      return res.status(403).json({
        message: "Invalid token.",
        success: false
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}

const adminAuth = (req, res, next) => {
  passport.authenticate('local-login', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: err,
        message: "Não foi possivel autenticar usuário.",
        success: false
      });
    }
    if (!user) {
      return res.status(403).json({
        message: "Token inválido.",
        success: false
      });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Você não tem permissão de admin.",
        success: false
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}

/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) => {
  !roles.includes(req.user.role)
  ? res.status(401).json({
    message: "Acesso não autorizado",
  })
  : next();
}

const serializeUser = user => {
  return {
    role: user.role,
    username: user.username,
    email: user.email,
    name: user.name,
    _id: user._id,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  };
};

const userLogin = async (req, res, next) => {
  if (!req.body.credential) {
    return res.status(400).json({
      message: "O Token é obrigatório."
    });
  }
  const token = req.body.credential;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  if (!ticket.payload) {
    return res.status(400).json({
      message: "Token não foi verificado."
    });
  }

  const { sub, name, email, email_verified, picture } = ticket.payload;

  if (!email_verified) {
    return res.status(400).json({
      message: "Email google não verificado."
    });
  }

  User.findOne({ email })
  .then(user => {
    if (user) {
      const token = generateToken(user);

      let result = {
        username: user.username,
        role: user.role,
        email: user.email,
        token: token,
      };
      return res.header("Authorization", token).status(200).json({
        ...result,
        message: "Parabens! Você está logado.",
        success: true
      });
    } else {
      let password = email + SECRET;
      bcrypt.hash(password, 12).then(hashedpassword => {
        const newUser = new User({
          username: email.split("@")[0],
          email,
          password: hashedpassword,
          name,
          role: "user",
          google: true
        });

        newUser.save().then(user => {
          const token = generateToken(user);

          let result = {
            username: user.username,
            role: user.role,
            email: user.email,
            token: token,
          };
          return res.header("Authorization", result.token).status(200).json({
            ...result,
            message: "Parabens! Você está logado.",
            success: true
          });
        });
      });
    }
  })
}

const registerCompany = async (req, res, next) => {
  let credentials = req.body;
  let validation = companyValidator.validate(credentials);

  if (validation.error) {
    return res.status(400).json({
      message: formatError(validation.error),
      success: false
    });
  }

  let company = await Company.findOne({ company_cnpj: credentials.company_cnpj });
  if (company) {
    return res.status(400).json({
      message: "CNPJ já foi cadastrado.",
      success: false
    });
  }
  company = new Company({
    ...credentials,
    role: "company",
  });
  company.save().then(company => {
    return res.status(201).json({
      message: "Empresa cadastrada com sucesso.",
      success: true
    });
  }).catch(err => {
    return res.status(500).json({
      message: "Não foi possivel cadastrar a empresa.",
      error: err,
      success: false
    });
  });
}

module.exports = {
  adminAuth,
  adminLogin,
  companyLogin,
  userAuth,
  userLogin,
  checkRole,
  adminRegister,
  registerCompany,
  serializeUser
};
