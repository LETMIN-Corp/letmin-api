const router = require("express").Router();

require("dotenv").config();

const { userLogin, getUserData, updateUser } = require("../controllers/userController");
const { searchVacancies } = require("../controllers/vacancyController");

// Bring in the User Registration function
const {
  passportAuth,
  checkRole,
  serializeUser
} = require("../utils/Auth");

// Users Registeration Route
router.post("/login-user", userLogin);
// Profile Route
router.get("/profile", passportAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

router.get("/vacancy", searchVacancies);
router.get("/get-user", passportAuth, getUserData);
router.get("/update-user", passportAuth, updateUser);

// Users Protected Route
router.get("/user-protectd",
  passportAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);


module.exports = router;
