const router = require('express').Router();

const { adminRegister, adminLogin } = require('../controllers/adminController');
const { registerCompany, loginCompany, createForgotPasswordToken, resetPassword, checkRecoveryToken } = require('../controllers/companyController');
const { userLogin } = require('../controllers/userController');
const { passportAuth, checkRole } = require('../utils/Auth');

const { USER, ADMIN, COMPANY } = require('../utils/constants');
const validation = require('../middlewares/validation');
const { registerCompanyValidator, loginCompanySchema } = require('../validate/company');
const { adminRegisterValidator, adminLoginValidator } = require('../validate/admin');
const { createComplaint } = require('../controllers/complaintController');
const confirmCheck = require('../middlewares/confirmCheck');

router.get('/healthcheck', confirmCheck('Olá mundo'));

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

router.post('/create-complaint', passportAuth, createComplaint);

// Protected Routes for specific roles
router.use('/user', passportAuth, checkRole(USER), require('./users'));
router.use('/admin', passportAuth, checkRole(ADMIN), require('./admin'));
router.use('/company', passportAuth, checkRole(COMPANY), require('./company'));

const multer = require('multer');
const multerConfig = require('../config/multer');

const { API_URL } = require('../config');

var upload = multer(multerConfig).single('file')

router.post('/upload', passportAuth, checkRole([USER, COMPANY]), 
			(req, res) => {
				upload(req, res, function (err) {
					if (err instanceof multer.MulterError || err) {
						return res.status(400).json({
							success: false,
							message: 'Erro no upload do arquivo: ' + err
						})
					}
					if (!req.file) {
						return res.status(400).json({
							success: false,
							message: 'Nenhum arquivo enviado'
						})
					}
					return res.status(200).json({
						success: true,
						uri: req.file.key,
						message: 'Arquivo enviado com sucesso',
						file: API_URL + '/api/uploads/' + req.file.filename
					})
				})
			});

const express = require('express');
const path = require('path');

router.use('/uploads', express.static(path.join(__dirname, '../..', 'uploads')));	

module.exports = router;