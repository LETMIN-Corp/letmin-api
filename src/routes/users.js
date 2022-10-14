const router = require('express').Router();
const validation = require('../middlewares/validation');

const { updateUser, getUserData } = require('../controllers/userController');
const { 
	searchVacancies, 
	getCandidateVacancies,
	getVacancy, 
	applyToVacancy, 
	getAppliedVacancies,
	cancelApplyVacancy
} = require('../controllers/vacancyController');
const { updateUserFormations, updateUserExperiences } = require('../validate/user');

const confirmCheck = require('../middlewares/confirmCheck');

// Profile Route
router.get('/get-user', getUserData);
router.get('/update-user', updateUser);

// Vacancy Routes
router.get('/vacancy', searchVacancies);
router.get('/vacancy-candidate', getCandidateVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.post('/apply-vacancy', applyToVacancy);
router.post('/cancel-apply-vacancy', cancelApplyVacancy);

// User CRUD Routes
router.get('/get-user', getUserData);
router.post('/update-user', updateUser);
router.post('/check-user-experiences', validation(updateUserExperiences), confirmCheck('Objeto válido'));
router.post('/check-user-formations', validation(updateUserFormations), confirmCheck('Objeto válido'));

router.get('/get-candidate-applications', getAppliedVacancies);

module.exports = router;
