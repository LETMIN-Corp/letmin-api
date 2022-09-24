const cors = require('cors');
const express = require('express');
const { connect } = require('mongoose');
const { success, error } = require('consola');
const passport = require('passport');
const helmet = require('helmet');
const { setTimeout } = require('timers/promises');

// Bring in the app constants
const { DB, PORT, HOST, RECONNECT_DELAY, CLIENT_URL } = require('./config');

// Initialize the application
const app = express();

// Middlewares
app.use(cors({
	origin: CLIENT_URL,
	exposedHeaders: ['Authorization', 'Content-Type'],
	optionsSuccessStatus: 200,
}));

// parse application/json and application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

app.use(passport.initialize());
require('./middlewares/passport')(passport);

//Routes 
app.use('/api', require('./routes/routes'));
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route não encontrada.', 
	});
});

const startApp = async () => {
	try {
		// Connection With DB
		connect(DB);

		success({
			message: `Successfully connected with the Database \n${DB}`,
			badge: true
		});

		// Start Listenting for the server on PORT
		app.listen(PORT, HOST, () =>
			success({ message: `🌍 Server running at http://localhost:${PORT}/`, badge: true })
		);
	} catch (err) {
		setTimeout(RECONNECT_DELAY);
		error({
			message: `❌ Unable to connect with Database \n${err}`,
			badge: true
		});
		startApp();
	}
};

startApp();
