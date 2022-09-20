
const formatError = (err) => {
	// map all the errors in an object with the field name
	const errors = err.details.reduce((acc, curr) => {  
		acc[curr.context.key] = curr.message;
		return acc;
	}, {});
	return errors;
};

module.exports = formatError;