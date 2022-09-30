const router = require('express').Router();

const { adminRegister, adminLogin } = require('../controllers/adminController');
const { registerCompany, loginCompany } = require('../controllers/companyController');
const { userLogin } = require('../controllers/userController');
const { passportAuth, checkRole } = require('../utils/Auth');

const { USER, ADMIN, COMPANY } = require('../utils/constants');
const validation = require('../middlewares/validation');
const { loginCompanySchema, companyValidator } = require('../validate/company');
const adminValidator = require('../validate/admin');
const { createComplaint } = require('../controllers/complaintController');

router.get('/healthcheck', (req, res) => {
	res.json({
		success: true,
		message: 'Olá Mundo',
	});
});

// Users Authentication Route
router.post('/user/login', userLogin);

// Admin Authentication Routes
router.post('/admin/register', validation(adminValidator), adminRegister);
router.post('/admin/login', validation(adminValidator), adminLogin);

// Company Authentication Routes
router.post('/company/register', validation(companyValidator), registerCompany);
router.post('/company/login', validation(loginCompanySchema), loginCompany);

router.post('/create-complaint', passportAuth, createComplaint);

// Protected Routes for specific roles
router.use('/user', passportAuth, checkRole(USER), require('./users'));
router.use('/admin', passportAuth, checkRole(ADMIN), require('./admin'));
router.use('/company', passportAuth, checkRole(COMPANY), require('./company'));

module.exports = router;