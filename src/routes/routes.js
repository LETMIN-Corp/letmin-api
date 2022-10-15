const router = require('express').Router();

const { adminRegister, adminLogin } = require('../controllers/adminController');
const { registerCompany, loginCompany, createForgotPasswordToken, resetPassword, checkRecoveryToken } = require('../controllers/companyController');
const { userLogin } = require('../controllers/userController');
const { passportAuth, checkRole, changeProfilePicture } = require('../utils/Auth');

const { USER, ADMIN, COMPANY } = require('../utils/constants');
const validation = require('../middlewares/validation');
const { registerCompanyValidator, loginCompanySchema } = require('../validate/company');
const { adminRegisterValidator, adminLoginValidator } = require('../validate/admin');
const { createComplaint } = require('../controllers/complaintController');
const confirmCheck = require('../middlewares/confirmCheck');

router.get('/healthcheck', confirmCheck('Olá Mundo'));

// Recover password routes
router.post('/send-recovery-email', createForgotPasswordToken);
router.post('/check-recovery-token', checkRecoveryToken, confirmCheck('Token válido'));
router.post('/new-password', checkRecoveryToken, resetPassword);

// Users Authentication Route
router.post('/user/login', userLogin);

// Admin Authentication Routes
router.post('/admin/register', validation(adminRegisterValidator), adminRegister);
router.post('/admin/login', validation(adminLoginValidator), adminLogin);

// Company Authentication Routes
router.post('/company/register', validation(registerCompanyValidator), registerCompany);
router.post('/company/login', validation(loginCompanySchema), loginCompany);

const complaintValidator = require('../validate/complaint');
router.post('/create-complaint', passportAuth, validation(complaintValidator), createComplaint);

// Protected Routes for specific roles
router.use('/user', passportAuth, checkRole(USER), require('./users'));
router.use('/admin', passportAuth, checkRole(ADMIN), require('./admin'));
router.use('/company', passportAuth, checkRole(COMPANY), require('./company'));

router.post('/upload', passportAuth, checkRole([USER, COMPANY]), changeProfilePicture);

const express = require('express');
const path = require('path');

router.use('/uploads', express.static(path.join(__dirname, '../..', 'uploads')));	

module.exports = router;