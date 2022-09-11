const passport = require("passport");

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
    picture: user.picture,
    name: user.name,
    _id: user._id,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  };
};

module.exports = {
  adminAuth,
  userAuth,
  checkRole,
  serializeUser
};
