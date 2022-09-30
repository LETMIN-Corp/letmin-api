const formatError = require('../utils/formatError');

// Check if the use of this function is still valid, will be deprecated in the future
module.exports = (schema, checkBearer = false) => {
	return (req, res, next) => {
		try {
			if (checkBearer) {
				if (!req.headers.authorization) {
					return res.status(401).json({
						success: false,
						message: 'Nenhum Token fornecido',
					});
				}
			}

			const validation = schema.validate(req.body);

			if (validation.error) {
				return res.status(400).json({
					success: false,
					message: formatError(validation.error),
				});
			}

			next();

		} catch (err) {
			return res.status(400).json({
				success: false,
				message: 'Error ' + err,
			});
		}
	};
};