const router = require('express').Router();

const { adminRegister, adminLogin } = require('../controllers/adminController');
const { registerCompany, loginCompany } = require('../controllers/companyController');
const { userLogin } = require('../controllers/userController');
const { passportAuth, checkRole } = require('../utils/Auth');

const { USER, ADMIN, COMPANY } = require('../utils/constants');
const validation = require('../middlewares/validation');
const { loginCompanySchema, companyValidator } = require('../validate/company');
const adminValidator = require('../validate/admin');

router.get('/healthcheck', (req, res) => {
	res.json({
		success: true,
		message: 'Olá Mundo',
	});
});


const sendEmail = require('../utils/mailer');
		
router.get('/mailto/', async (req, res) => {
	// await sendEmail({
    //     email: 'email@provider.br',   // list of receivers
    //     subject: 'Sending Email using Node.js',
    //     message: 'That was easy!',
    //     html: `<b>Hey there! </b>
    //         <br> This is our first message sent with Nodemailer<br/>`,
	// 	attachments: [
	// 		{
	// 			filename: 'text notes.txt',
	// 			path: './src/routes/users.js'
	// 		},
    // 	]
	// }, (err, info) => {
	// 	if(err) {
	// 		res.status(500).json({
	// 			success: false,
	// 			message: 'Erro ao enviar email',
	// 			error: err,
	// 		});
	// 	}
			
	// 	console.log('info	', info);
	// 	res.status(200).json({
	// 		success: true,
	// 		message: 'Email enviado com sucesso',
	// 	});
	// });
});

// Users Authentication Route
router.post('/user/login', userLogin);

// Admin Authentication Routes
router.post('/admin/register', validation(adminValidator), adminRegister);
router.post('/admin/login', validation(adminValidator), adminLogin);

// Company Authentication Routes
router.post('/company/register', validation(companyValidator), registerCompany);
router.post('/company/login', validation(loginCompanySchema), loginCompany);


router.use('/user', passportAuth, checkRole(USER), require('./users'));
router.use('/admin', passportAuth, checkRole(ADMIN), require('./admin'));
router.use('/company', passportAuth, checkRole(COMPANY), require('./company'));

module.exports = router;