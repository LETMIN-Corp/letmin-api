//const passport = require('passport');

module.exports = (app) => {

	app.get('/healthcheck', (req, res) => {
		res.json({
			message: 'Hello World',
			success: true
		});
	});

	app.use('/api/users', require('./routes/users'));

	app.use('/api/users', require('./routes/admin'));

	app.use('/api/users', require('./routes/company'));

	app.use((req, res) => {
		res.status(404).json({
			message: 'Route not Found', 
			success: false
		});
	});
};