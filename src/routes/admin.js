const router = require('express').Router();
const validation = require('../middlewares/validation');
const adminValidator = require('../validate/admin');

const { 
	adminLogin,
	adminRegister,
	getAllCompanies,
	changeCompanyBlockStatus,
	getAllUsers,
	changeUserBlockStatus,
} = require('../controllers/adminController');

// Bring in the User Registration function
const {
	passportAuth,
	checkRole,
	serializeUser
} = require('../utils/Auth');
const { ADMIN } = require('../utils/constants');

// Admin Registration Route
router.post('/register-admin', validation(adminValidator), adminRegister);

// Admin Login Route
router.post('/login-admin', validation(adminValidator), adminLogin);

router.get('/get-all-companies', passportAuth, checkRole(ADMIN), getAllCompanies);
router.patch('/company-block', passportAuth, checkRole(ADMIN), changeCompanyBlockStatus);

router.get('/get-all-users', passportAuth, checkRole(ADMIN), getAllUsers);
router.patch('/user-block', passportAuth, checkRole(ADMIN), changeUserBlockStatus);

module.exports = router;