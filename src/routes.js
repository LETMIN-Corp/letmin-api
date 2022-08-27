const passport = require("passport");

module.exports = (app) => {

  app.get("/healthcheck", (req, res) => {
    res.json({
      message: "Hello World",
      success: true
    });
  });

  app.use('/api/users', require("./routes/users"));

  app.use('/api/users', require("./routes/admin"));
}