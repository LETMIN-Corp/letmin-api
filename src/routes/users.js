const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("../utils/Auth");

require("dotenv").config();
const { SECRET } = require("../config");
// Users Registeration Route
router.get("/google", userAuth);

router.get('/google/callback', passport.authenticate('google', {
  successRedirect : process.env.CLIENT_URL + '/register',
  failureRedirect : '/users/register-user'
}));

// async (req, res) => {
//   await userRegister(req.body, "user", res);
// });

// Users Login Route
router.post("/login-user", async (req, res) => {
  await userLogin(req.body, "user", res);
});

// Profile Route
router.get("/profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

// Users Protected Route
router.get("/user-protectd",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);


module.exports = router;
