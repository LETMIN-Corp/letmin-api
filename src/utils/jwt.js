const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const { OAuth2Client } = require('google-auth-library');

const { SECRET, CLIENT_ID } = require('../config');

function generateToken(user, role) {
	return jwt.sign(
		{
			user_id: user._id,
			sub: user.id,
			role: role,
			username: user.username,
			email: user.email,
			iat: new Date().getTime(), // Current Time
			exp: new Date().setDate(new Date().getDate() + 1), // Current Time + 1 day ahead
		},
		SECRET
	);
}

const verifyToken = (token) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, SECRET, (err, payload) => {
			if (err) return reject(err);
			resolve(payload);
		});
	});
};

async function verifyGoogleToken(res, token) {
	const client = new OAuth2Client(CLIENT_ID);
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID
	});

    
	if (!ticket.payload) {
		return res.status(400).json({
			success: false,
			message: 'Token não foi verificado.'
		});
	}
	return ticket.payload;
}

const decodeToken = (token) => {
	return jwt_decode(token);
};

module.exports = {
	generateToken,
	verifyToken,
	verifyGoogleToken,
	decodeToken
};