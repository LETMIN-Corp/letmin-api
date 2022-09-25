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


router.get('/get-all-companies', passportAuth, checkRole(ADMIN), getAllCompanies);
router.patch('/company-block', passportAuth, checkRole(ADMIN), changeCompanyBlockStatus);

router.get('/get-all-users', passportAuth, checkRole(ADMIN), getAllUsers);
router.patch('/user-block', passportAuth, checkRole(ADMIN), changeUserBlockStatus);

module.exports = router;