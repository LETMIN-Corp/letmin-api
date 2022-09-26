const router = require('express').Router();
const validation = require('../middlewares/validation');
const { vacancyValidator } = require('../validate/vacancy');
const { updateCompanyValidator, updateHolderValidator } = require('../validate/company');
const { 
	insertVacancy,
	getAllVacancies,
	getAllCompanyVacancies,
	getVacancy,
	confirmVacancy,
	searchVacancies,
	closeVacancy,
} = require('../controllers/vacancyController');
const { getCompanyData, searchUsers, updateCompanyData, updateHolderData } = require('../controllers/companyController');

// Company Profile Route
router.get('/company-data', getCompanyData);
router.post('/update-company-company', validation(updateCompanyValidator), updateCompanyData);
router.post('/update-company-holder', validation(updateHolderValidator), updateHolderData);

// Vacancy Crud Routes
router.post('/register-vacancy', validation(vacancyValidator), insertVacancy);
router.get('/get-all-vacancies', getAllVacancies);
router.get('/get-company-vacancies', getAllCompanyVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.get('/search-vacancies/:search?', searchVacancies);
router.patch('/confirm-vacancy/:id', confirmVacancy);
router.delete('/close-vacancy/:id', closeVacancy);
router.get('/user', searchUsers);

module.exports = router;