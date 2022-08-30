const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const Company = require("../models/Company");
const { SECRET } = require("../config");
const {OAuth2Client} = require('google-auth-library');
const jwt_decode = require('jwt-decode');
require('dotenv').config();

const {
  generateToken,
  verifyToken,
  decodeToken
} = require("../utils/jwt");

/**
 * @DESC To register the user (ADMIN, SUPER_ADMIN, USER)
 */
const userRegister = async (userDets, role, res) => {
  if (userDets.google)
  try {
    // check if filds are empty
    if (!userDets.username || !userDets.password || !userDets.email) {
      return res.status(400).json({
        message: "Please fill all the fields"
      });
    }

    // Validate the username
    let usernameNotTaken = await validateUsername(userDets.username || "");
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: `Username is already taken.`,
        success: false
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(userDets.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
        success: false
      });
    }

    // Get the hashed password
    const password = await bcrypt.hash(userDets.password, 12);
    // create a new user
    const newUser = new User({
      ...userDets,
      password,
      role
    });

    await newUser.save();
    return res.status(201).json({
      message: "You are successfully registered. Please now login.",
      success: true
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      message: "Unable to create your account.",
      success: false
    });
  }
};

/**
 * @DESC To Login the user (ADMIN, SUPER_ADMIN, USER)
 */
const userLogin = async (userCreds, role, res) => {
  let { email, password } = userCreds;
  
  // First Check if the email is in the database
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "Email is not found. Invalid login credentials.",
      success: false
    });
  }
  // We will check the role
  if (user.role !== role) {
    return res.status(403).json({
      message: "Please make sure you are logging in from the right portal/place (permission).",
      success: false
    });
  }
  // That means user is existing and trying to signin from the right portal
  // Now check for the password
  let isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
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
      message: "Hurray! You are now logged in.",
      success: true
    });
  } else {
    return res.status(403).json({
      message: "Incorrect password.",
      success: false
    });
  }
};

const validateUsername = async username => {
  let user = await User.findOne({ username });
  return user ? false : true;
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
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "You are not an admin.",
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
    message: "Unauthorized Access",
  })
  : next();
}

const validateEmail = async email => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

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

const googleAuth = async (req, res, next) => {
  if (!req.body.token) {
    return res.status(400).json({
      message: "Token is required."
    });
  }
  const token = req.body.token;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  if (!ticket.payload) {
    return res.status(400).json({
      message: "Token is not verified."
    });
  }

  const { sub, name, email, email_verified, picture } = ticket.payload;

  if (!email_verified) {
    console.log('email not verified');
    return res.status(400).json({
      message: "Email verification failed."
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
        message: "Hurray! You are now logged in.",
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
            message: "You are now logged in.",
            success: true
          });
        });
      });
    }
  })
}

const companyValidator = require("../validate/company");

const registerCompany = async (req, res, next) => {
  companyValidator.validateAsync(req.body)
    .then(async (value) => {
      let company = await Company.findOne({ email: value.email });
      if (company) {
        return res.status(400).json({
          message: "Company already exists.",
          success: false
        });
      }
      company = new Company({
        role: "company",
        company_name: value.company_name,
        company_cnpj: value.company_cnpj,
        company_email: value.company_email,
        company_phone: value.company_phone,
        company_address: value.company_address,
        holder_name: value.holder_name,
        holder_cpf: value.holder_cpf,
        holder_email: value.holder_email,
        holder_phone: value.holder_phone,
        holder_password: value.holder_password,
        holder_confirmPassword: value.holder_confirmPassword,
        plan_types: value.plan_types,
        card_type: value.card_type
      });
      company.save().then(company => {
        return res.status(201).json({
          message: "Company created successfully.",
          success: true
        });
      }).catch(err => {
        return res.status(500).json({
          message: "Unable to create company.",
          success: false
        });
      });
    })
    .catch(err => {
        // map all the errors in an object with the field name
        const errors = err.details.reduce((acc, curr) => {  
            acc[curr.context.key] = curr.message;
            return acc;
        }, {});

        return res.status(400).json({
            message: errors,
            success: false
        });
        
    });
}


module.exports = {
  userAuth,
  adminAuth,
  googleAuth,
  checkRole,
  userLogin,
  userRegister,
  registerCompany,
  serializeUser
};
