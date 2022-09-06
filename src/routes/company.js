const router = require("express").Router();
const { getCompanyData } = require("../entities/company");
// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  loginCompany,
  checkRole,
  serializeUser,
  registerCompany,
} = require("../utils/Auth");

const companyValidator = require("../validate/company");

// Company Registration Route
router.post("/register-company", registerCompany);

// Company Login Route
router.post("/login-company",  async (req, res) => {
    await loginCompany(req.body, res);
});

router.post("/get-company-data", getCompanyData);

module.exports = router;