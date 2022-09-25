const router = require('express').Router();
const validation = require('../middlewares/validation');
const { vacancyValidator } = require('../validate/vacancy');
const { 
	insertVacancy,
	getAllVacancies,
	getAllCompanyVacancies,
	getVacancy,
	confirmVacancy,
	searchVacancies,
	closeVacancy,
} = require('../controllers/vacancyController');
const { getCompanyData } = require('../controllers/companyController');

// Company Profile Route
router.get('/company-data', getCompanyData);

const {
	passportAuth,
	checkRole,
	serializeUser
} = require('../utils/Auth');


// Vacancy Crud Routes
router.post('/register-vacancy', validation(vacancyValidator), insertVacancy);
router.get('/get-all-vacancies', getAllVacancies);
router.get('/get-company-vacancies', getAllCompanyVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.get('/search-vacancies/:search?', searchVacancies);
router.patch('/confirm-vacancy/:id', confirmVacancy);
router.delete('/close-vacancy/:id', closeVacancy);

module.exports = router;