
const validateError = (err, res) => {
    // map all the errors in an object with the field name
    const errors = err.details.reduce((acc, curr) => {  
        acc[curr.context.key] = curr.message;
        return acc;
    }, {});

    return res.status(400).json({
        success: false,
        message: errors,
    });
}

module.exports = validateError;