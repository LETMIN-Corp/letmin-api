const router = require('express').Router();
const validation = require('../middlewares/validation');
const { vacancyValidator } = require('../validate/vacancy');
const { updateCompanyValidator, updateHolderValidator } = require('../validate/company');
const { 
	insertVacancy,
	getVacanciesCompany,
	getAllCompanyVacancies,
	confirmVacancy,
	searchVacancies,
	closeVacancy,
	getAllCandidates,
	getCandidate,
	updateVacancy,
} = require('../controllers/vacancyController');
const { getCompanyData, searchUsers, updateCompanyData, updateHolderData, addToTalentBank, removeFromTalentBank, getTalentBank, getVacancy } = require('../controllers/companyController');

// Company Profile Route
router.get('/company-data', getCompanyData);
router.post('/update-company-company', validation(updateCompanyValidator), updateCompanyData);
router.post('/update-company-holder', validation(updateHolderValidator), updateHolderData);

// Vacancy CRUD Routes
router.post('/register-vacancy', validation(vacancyValidator), insertVacancy);
router.get('/get-all-vacancies', getVacanciesCompany);
router.get('/get-company-vacancies', getAllCompanyVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.get('/search-vacancies/:search?', searchVacancies);
router.patch('/confirm-vacancy/:id', confirmVacancy);
router.delete('/close-vacancy/:id', closeVacancy); //remove
router.patch('/update-vacancy', validation(vacancyValidator), updateVacancy);
router.get('/user', searchUsers);

router.get('/get-all-candidates/:id', getAllCandidates);
router.get('/get-candidate/:id', getCandidate);

// Talent bank CRUD routes
router.post('/add-to-talent-bank', addToTalentBank);
router.post('/remove-from-talent-bank', removeFromTalentBank);
router.get('/get-talent-bank', getTalentBank);

module.exports = router;
