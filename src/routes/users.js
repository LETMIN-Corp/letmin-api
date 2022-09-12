const router = require("express").Router();

require("dotenv").config();

const { userLogin } = require("../controllers/userController");

// Bring in the User Registration function
const {
  passportAuth,
  passportAuth,
  checkRole,
  serializeUser
} = require("../utils/Auth");

// Users Registeration Route
router.post("/login-user", userLogin );

// Profile Route
router.get("/profile", passportAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

// Users Protected Route
router.get("/user-protectd",
  passportAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);


module.exports = router;
