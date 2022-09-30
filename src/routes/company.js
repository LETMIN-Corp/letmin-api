const router = require('express').Router();
const validation = require('../middlewares/validation');
const { vacancyValidator } = require('../validate/vacancy');
const { updateCompanyValidator, updateHolderValidator } = require('../validate/company');
const { 
	insertVacancy,
	getVacanciesCompany,
	getAllCompanyVacancies,
	getVacancyData,
	confirmVacancy,
	searchVacancies,
	closeVacancy,
	getAllCandidates,
	getCandidate,
} = require('../controllers/vacancyController');
const { getCompanyData, searchUsers, updateCompanyData, updateHolderData } = require('../controllers/companyController');
const { createComplaint } = require('../controllers/complaintController');

// Company Profile Route
router.get('/company-data', getCompanyData);
router.post('/update-company-company', validation(updateCompanyValidator), updateCompanyData);
router.post('/update-company-holder', validation(updateHolderValidator), updateHolderData);

// Vacancy Crud Routes
router.post('/register-vacancy', validation(vacancyValidator), insertVacancy);
router.get('/get-all-vacancies', getVacanciesCompany);
router.get('/get-company-vacancies', getAllCompanyVacancies);
//router.get('/get-vacancy/:id', getVacancyData);
router.get('/search-vacancies/:search?', searchVacancies);
router.patch('/confirm-vacancy/:id', confirmVacancy);
router.delete('/close-vacancy/:id', closeVacancy);
router.get('/user', searchUsers);

router.get('/get-all-candidates/:id', getAllCandidates);
router.get('/get-candidate/:id', getCandidate);

module.exports = router;