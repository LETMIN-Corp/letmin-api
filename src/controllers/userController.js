const User = require('../models/User');
const { USER } = require('../utils/constants');
const bcrypt = require('bcryptjs');

const { SECRET } = require('../config');

const {
	generateToken,
	verifyGoogleToken,
} = require('../utils/jwt');

/**
 * Login user
 * @route POST /user/login
 */
const userLogin = async (req, res) => {
	if (!req.body.credential) {
		return res.status(400).json({
			success: false,
			message: 'O Token é obrigatório.'
		});
	}
  
	let payload;

	try {
		payload = await verifyGoogleToken(res, req.body.credential);

		if (!payload || !payload.email_verified) {
			return res.status(400).json({
				success: false,
				message: 'Email google não verificado.'
			});
		}

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Token usado muito tarde ou inválido. Verifique sua conexão e horário'
		});
	}

	const { sub, name, email, picture } = payload;
  
	User.findOne({ email })
		.then( async (user) => {
			// User already exists
			if (user) {
				if (user.blocked) {
					return res.status(401).json({
						success: false,
						message: 'Usuário bloqueado, entre em contato com o adminsitrador.',
					});
				}

				let isMatch = await bcrypt.compare(sub + SECRET, user.password);
				if (!isMatch) {
					return res.status(400).json({
						success: false,
						message: 'Credenciais incorretas',
					});
				}

				const token = generateToken(user, USER);
  
				let result = {
					username: user.username,
					role: user.role,
					picture: user.picture,
					email: user.email,
					token: token,
				};
				return res.header('Authorization', token).status(200).json({
					success: true,
					message: 'Parabéns! Você está logado.',
					...result,
				});
			}
			// User does not exist
			let hashedpassword = await bcrypt.hash(sub + SECRET, 12);
			const newUser = new User({
				username: email.split('@')[0],
				email,
				password: hashedpassword,
				name,
				picture
			});
  
			newUser.save((err, user) => {
				const token = generateToken(user, USER);
  
				let result = {
					username: user.username,  
					role: USER,
					email: user.email,
					token: token,
				};
				return res.header('Authorization', result.token).status(200).json({
					...result,
					message: 'Parabéns! Você está logado.',
					success: true
				});
			});
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				message: 'Error ' + err,
			});
		});
};

/**
 * Get user by id (On JWT)
 * @route GET /user/get-user
 */
const getUserData = async (req, res) => {
	const { id } = req.user;

	User.findById(id).select('-password')
		.then((user) => {
			if (!user) {
				return res.status(400).json({
					message: 'Usuário não encontrado.',
					success: false
				});
			}
			return res.status(200).json({
				user,
				success: true
			});
		})
		.catch((err) => {
			return res.status(400).json({
				message: 'Error ' + err,
				success: false
			});
		});
};

/**
 * Update user data
 * @route POST /user/update-user
*/
const updateUser = async (req, res, next) => {
    const { _id } = req.user;

	User.findByIdAndUpdate(_id, req.body, { new: true }).then((user) => {
        if (!user) {
            return res.status(400).json({
                message: "Usuário não encontrado.",
                success: false
            });
        }
        return res.status(200).json({
			message: "Alterado com sucesso!",
            success: true,
            user,
        });
    })
    .catch((err) => {
        return res.status(400).json({
            message: 'Error ' + err,
            success: false
        });
    });
}

const updateUserFormations = async (req, res, next) => {
    try {
		let userId = req.user;
		let formations = req.body.formations;
		let user = await User.findById(userId);

		user.formations.push(formations);
		user.save().then(() => {
			return res.status(200).json({
				success: true,
			});
		})
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao adicionar a formação ao seu banco!.' + err,
		});
	}
}

const updateUserExperiences = async (req, res, next) => {
    try {
		let userId = req.user;
		let experiences = req.body.experiences;
		let user = await User.findById(userId);

		user.experiences.push(experiences);
		user.save().then(() => {
			return res.status(200).json({
				success: true,
			});
		})
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Ocorreu um erro ao adicionar a experiência ao seu banco!.' + err,
		});
	}
}

module.exports = {
    userLogin,
    getUserData,
    updateUser,
	updateUserFormations,
	updateUserExperiences,
	userLogin,
	getUserData,
	updateUser,
};
