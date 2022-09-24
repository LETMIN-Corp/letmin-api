const router = require('express').Router();
const validation = require('../middlewares/validation');
const { vacancyValidator } = require('../validate/vacancy');
const { companyValidator, loginCompanySchema } = require('../validate/company');
const { 
	insertVacancy,
	getAllVacancies,
	getAllCompanyVacancies,
	getVacancy,
	confirmVacancy,
	searchVacancies,
	closeVacancy,
} = require('../controllers/vacancyController');
const { registerCompany, loginCompany, getCompanyData } = require('../controllers/companyController');
const { COMPANY } = require('../utils/constants');

// Company Registration Route
router.post('/register-company', validation(companyValidator), registerCompany);
// Company Login Route
router.post('/login-company', validation(loginCompanySchema), loginCompany);


// Company Profile Route
router.get('/company-data', getCompanyData);

const {
	passportAuth,
	checkRole,
	serializeUser
} = require('../utils/Auth');

// Vacancy Crud Routes
router.post('/register-vacancy', validation(vacancyValidator), insertVacancy);
router.get('/get-all-vacancies', passportAuth, checkRole(COMPANY), getAllVacancies);
router.get('/get-company-vacancies', passportAuth, checkRole(COMPANY), getAllCompanyVacancies);
router.get('/get-vacancy/:id', passportAuth, checkRole(COMPANY), getVacancy);
router.get('/search-vacancies/:search?', passportAuth, checkRole(COMPANY), searchVacancies);
router.patch('/confirm-vacancy/:id', passportAuth, checkRole(COMPANY), confirmVacancy);
router.delete('/close-vacancy/:id', passportAuth, checkRole(COMPANY), closeVacancy);

module.exports = router;