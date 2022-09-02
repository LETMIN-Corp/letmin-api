const router = require("express").Router();
// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  adminLogin,
  checkRole,
  adminRegister,
  serializeUser
} = require("../utils/Auth");

// Admin Registration Route
router.post("/register-admin", async (req, res) => {
  await adminRegister(req.body, res);
});

// Admin Login Route
router.post("/login-admin", async (req, res) => {
    await adminLogin(req.body, res);
});

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