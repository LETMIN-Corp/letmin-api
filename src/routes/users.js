const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  googleAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("../utils/Auth");

require("dotenv").config();


// Users Registeration Route
router.post("/auth/google", googleAuth );

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

// Users Login Route
router.post("/login-user", async (req, res) => {
  await userLogin(req.body, "user", res);
});

// Profile Route
router.get("/profile", adminAuth, async (req, res) => {
  //console.log(req);
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
