const router = require("express").Router();
// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("../utils/Auth");

// Admin Registration Route
router.post("/register-admin", async (req, res) => {
    await userRegister(req.body, "admin", res);
});
  
  // Super Admin Registration Route
router.post("/register-super-admin", async (req, res) => {
    await userRegister(req.body, "superadmin", res);
});

// Admin Login Route
router.post("/login-admin", async (req, res) => {
    await userLogin(req.body, "admin", res);
});

// Super Admin Login Route
router.post("/login-super-admin", async (req, res) => {
    await userLogin(req.body, "superadmin", res);
  });

// Admin Protected Route
router.get("/admin-protectd",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

// Super Admin Protected Route
router.get("/super-admin-protectd",
  userAuth,
  checkRole(["superadmin"]),
  async (req, res) => {
    return res.json("Hello Super Admin");
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