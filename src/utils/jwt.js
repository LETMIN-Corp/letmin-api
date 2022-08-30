const jwt = require("jsonwebtoken");
const jwt_decode = require('jwt-decode');

const { SECRET } = require("../config");

const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user._id,
            sub: user.id,
            role: user.role,
            username: user.username,
            email: user.email,
            iat: new Date().getTime(), // Current Time
            exp: new Date().setDate(new Date().getDate() + 1), // Current Time + 1 day ahead
        },
        SECRET,
        {
            //expiresIn: "1d",
        }
    );
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, payload) => {
            if (err) return reject(err);
            resolve(payload);
        });
    });
}

const decodeToken = (token) => {
    return jwt_decode(token);
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};