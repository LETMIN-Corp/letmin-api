const router = require("express").Router();
const validation = require("../middlewares/validation");
const adminValidator = require("../validate/admin");

const { adminLogin, adminRegister, getAllCompanies } = require("../controllers/adminController");

// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  checkRole,
  serializeUser
} = require("../utils/Auth");

// Admin Registration Route
router.post("/register-admin", validation(adminValidator), adminRegister);

// Admin Login Route
router.post("/login-admin", validation(adminValidator), adminLogin);

router.get("/get-all-companies", adminAuth, getAllCompanies);

// Admin Protected Route
router.get("/admin-protectd",
  adminAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

// Super Admin Protected Route
router.get("/super-admin-and-admin-protectd",
  userAuth,
  checkRole(["superadmin", "admin"]),
  async (req, res) => {
    return res.json("Super admin and Admin");
  }
);

module.exports = router;