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
      message: "Email is already taken",
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
      message: "You are successfully registered. Please now login.",
      success: true
    });
  })
  .catch((err) => {
    return res.status(500).json({
      error: err,
      message: "Unable to create your account.",
      success: false
    });
  })
};

/**
 * @DESC To Login the user (ADMIN, USER)
 */
const userLogin = async (userCreds, role, res) => {
  let validation;
  switch (role) {
    case "admin":
      validation = adminValidator.validate(userCreds);
      break;
    case "user":
      validation = userValidator.validate(userCreds);
      break;
    case "company":
      validation = companyLoginSchema.validate(userCreds);
      break;
    default:
      return res.status(400).json({
        message: "Invalid Login Credentials",
        success: false
      });
  }

  if (validation.error) {
    return res.status(400).json({
      message: formatError(validation.error),
      success: false
    });
  }
    
  if (role == 'admin') {
    const validation = adminValidator.validate(adminDets);

    if (validation.error) {
      return res.status(400).json({
        message: formatError(validation.error),
        success: false
      });
    }
  }
  if (role == 'user') {
    const validation = userValidator.validate(userCreds);

    if (validation.error) {
      return res.status(400).json({
        message: formatError(validation.error),
        success: false
      });
    }
  }
 
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
  console.log(req.body);
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
        ...value,
        role: "company",
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
      return res.status(400).json({
        success: false,
        message: formatError(err),
      });
    });
}

module.exports = {
  userAuth,
  adminAuth,
  googleAuth,
  checkRole,
  userLogin,
  adminRegister,
  registerCompany,
  serializeUser
};
