const router = require("express").Router();
// Bring in the User Registration function
const {
  userAuth,
  adminAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("../utils/Auth");

const companyValidator = require("../validate/company");

// Company Registration Route
router.post("/register-company", async (req, res) => {

    companyValidator.validateAsync(req.body)
    .then(async (value) => {
        await userRegister(req.body, "company", res);
        }
    )
    .catch(err => {
        // map all the errors in an object with the field name
        const errors = err.details.reduce((acc, curr) => {  
            acc[curr.context.key] = curr.message;
            return acc;
        }, {});

        return res.status(400).json({
            message: errors,
            success: false
        });
        
    });
});

// Company Login Route
router.post("/login-company",  async (req, res) => {
    await userLogin(req.body, "company", res);
});

module.exports = router;