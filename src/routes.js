const passport = require("passport");
// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("./utils/Auth");


// Import the local passport stragey from the middleware for the admin routes and the googleStrategy for the admin routes

module.exports = (app) => {

  app.get("/healthcheck", (req, res) => {
    res.json({
      message: "Hello World",
      success: true
    });
  });

  require('./middlewares/passport')(passport);

  app.use('/api/users', require("./routes/users"));

  app.use('/api/users', require("./routes/admin"));
}