const cors = require("cors");
const express = require("express");
const { connect } = require("mongoose");
const { success, error } = require("consola");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");

// Bring in the app constants
const { DB, PORT, HOST, CLIENT_URL } = require("./config");

// Initialize the application
const app = express();

process.env.TZ = "America/Sao Paulo";

// Middlewares
app.use(cors({
  origin: '*', //CLIENT_URL,
  exposedHeaders: ['Authorization', 'Content-Type'],
  optionsSuccessStatus: 200,
}));

// parse application/json and application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./middlewares/passport')(passport);

//Routes 
require("./routes")(app);

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
    error({
      message: `❌ Unable to connect with Database \n${err}`,
      badge: true
    });
    startApp();
  }
};

startApp();
