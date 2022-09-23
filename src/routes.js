module.exports = (app) => {

	app.get('/healthcheck', (req, res) => {
		res.json({
			success: true,
			message: 'Olá Mundo',
		});
	});
	
	app.use('/api/users', require('./routes/users'));

	app.use('/api/users', require('./routes/admin'));

	app.use('/api/users', require('./routes/company'));

	app.use((req, res) => {
		res.status(404).json({
			success: false,
			message: 'Route não encontrada.', 
		});
	});
};