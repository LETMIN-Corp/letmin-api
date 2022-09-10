const formatError = require("../utils/formatError");
const {
    decodeToken,
    jwtSign,
    jwtVerify,
} = require('../utils/jwt');

module.exports = (schema, checkBearer = false) => {
    return (req, res, next) => {
        try {
            if (checkBearer) {
                if (!req.headers.authorization) {
                    return res.status(401).json({
                        message: 'No token provided',
                        success: false,
                    });
                }
            }

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.status(400).json({
                    message: formatError(validation.error),
                    success: false
                });
            }

            next();

        } catch (err) {
            return res.status(400).json({
                message: err,
                success: false
            });
        }
    }
}