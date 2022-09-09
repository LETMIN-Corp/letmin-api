const formatError = require("../utils/formatError");

module.exports = (schema) => {
    return (req, res, next) => {
        
        try {
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