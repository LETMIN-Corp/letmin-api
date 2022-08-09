const cors = require("cors");
const express = require("express");
const bodyParser = require('body-parser')
const passport = require("passport");
const { connect } = require("mongoose");
const { success, error } = require("consola");

// Bring in the app constants
const { DB, PORT, CLIENT_URL } = require("./config");

// Initialize the application
const app = express();

// Middlewares
app.use(cors({
  origin: CLIENT_URL,
  exposedHeaders: ['Authorization', 'Content-Type'],
  optionsSuccessStatus: 200,
}));

// parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(passport.initialize());

require("./middlewares/passport")(passport);

// User Router Middleware
app.use("/api/users", require("./routes/users"));

app.get("/healthcheck", (req, res) => {
  res.json({
    message: "Hello World",
    success: true
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
    app.listen(PORT, () =>
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
