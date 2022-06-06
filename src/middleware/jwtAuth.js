const jwt = require('jsonwebtoken');
const { expressjwt: auth } = require('express-jwt');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const blacklist = require('express-jwt-blacklist');
const JsonResult = require('../results/json');
require('dotenv').config();

const refreshTokenList = {};

/*
if (config.environment === 'production') {
  blacklist.configure({
    store: {
      type: config.blacklist.type,
      host: config.blacklist.host,
      port: config.blacklist.port,
      keyPrefix: config.blacklist.keyPrefix,
    },
  });
}
*/

const authorize = auth({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'user',  // req.user
});

const decodeToken = (err, req, res, next) => {
  if (err.inner instanceof jwt.TokenExpiredError) {
    const token = req.headers.authorization.split(' ')[1];
    const { payload } = jwt.decode(token, { complete: true });
    const exp = refreshTokenList[payload.refreshToken];

    if (exp && exp.expires < Date.now()) {
      delete refreshTokenList[payload.refreshToken];
      return res.status(401).json({
        message: 'Refresh token expired',
      });
    }
  }

  return next(err);
};

const revokeToken = ({ user }, res, next) => {
  blacklist.revoke(user);
  delete refreshTokenList[user.refreshToken];

  next();
};

const generateToken = ({ user, result }, res) => {
  const refreshToken = crypto.createHash('sha256').update(uuid()).digest('hex');

  const token = jwt.sign({
    sub: user._id.toString(),
    email: user.email,
    permissions: user.permissions,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN,
  }, process.env.JWT_SECRET);

  refreshTokenList[refreshToken] = {
    token,
    expires: Date.now() + (process.env.JWT_EXPIRES_IN * 1000), // ms
  };

  res.json(new JsonResult({
    result,
    data: {
      token,
      refreshToken,
    },
  }));
  
};

module.exports = {
  authorize,
  decodeToken,
  revokeToken,
  generateToken,
};
