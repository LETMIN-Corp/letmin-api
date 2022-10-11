const router = require('express').Router();

const { adminRegister, adminLogin } = require('../controllers/adminController');
const { registerCompany, loginCompany, createForgotPasswordToken, resetPassword, checkRecoveryToken } = require('../controllers/companyController');
const { userLogin } = require('../controllers/userController');
const { passportAuth, checkRole } = require('../utils/Auth');

const { USER, ADMIN, COMPANY } = require('../utils/constants');
const validation = require('../middlewares/validation');
const { loginCompanySchema, companyValidator } = require('../validate/company');
const adminValidator = require('../validate/admin');
const { createComplaint } = require('../controllers/complaintController');

router.get('/healthcheck', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Olá Mundo',
	});
});

router.post('/send-recovery-email', createForgotPasswordToken);
router.post('/check-recovery-token', checkRecoveryToken, (req, res) => { return res.status(200).json({ success: true, message: 'Token válido' }); });
router.post('/new-password', checkRecoveryToken, resetPassword);

// Users Authentication Route
router.post('/user/login', userLogin);

// Admin Authentication Routes
router.post('/admin/register', validation(adminValidator), adminRegister);
router.post('/admin/login', validation(adminValidator), adminLogin);

// Company Authentication Routes
router.post('/company/register', validation(companyValidator), registerCompany);
router.post('/company/login', validation(loginCompanySchema), loginCompany);

const complaintValidator = require('../validate/complaint');
router.post('/create-complaint', passportAuth, validation(complaintValidator), createComplaint);

// Protected Routes for specific roles
router.use('/user', passportAuth, checkRole(USER), require('./users'));
router.use('/admin', passportAuth, checkRole(ADMIN), require('./admin'));
router.use('/company', passportAuth, checkRole(COMPANY), require('./company'));

module.exports = router;