const router = require("express").Router();

require("dotenv").config();

// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  userLogin,
  checkRole,
  serializeUser
} = require("../utils/Auth");

// Users Registeration Route
router.post("/login-user", userLogin );

// Profile Route
router.get("/profile", adminAuth, async (req, res) => {
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
