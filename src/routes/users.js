const router = require('express').Router();
const validation = require('../middlewares/validation');

const { updateUser, getUserData, deleteUserAccount } = require('../controllers/userController');
const { 
	searchVacancies, 
	getCandidateVacancies,
	getVacancy, 
	applyToVacancy, 
	getAppliedVacancies,
	cancelApplyVacancy
} = require('../controllers/vacancyController');

const { checkUserFormations, checkUserExperiences, userUpdateValidator, checkUserSkills } = require('../validate/user');

const confirmCheck = require('../middlewares/confirmCheck');

// Vacancy Routes
router.get('/vacancy', searchVacancies);
router.get('/vacancy-candidate', getCandidateVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.post('/apply-vacancy', applyToVacancy);
router.post('/cancel-apply-vacancy', cancelApplyVacancy);

// User CRUD Routes
router.get('/get-user', getUserData);
router.post('/update-user', validation(userUpdateValidator), updateUser);
router.post('/check-user-skills', validation(checkUserSkills), confirmCheck('Objeto válido'));
router.post('/check-user-experiences', validation(checkUserExperiences), confirmCheck('Objeto válido'));
router.post('/check-user-formations', validation(checkUserFormations), confirmCheck('Objeto válido'));
router.delete('/delete-account', deleteUserAccount);

router.get('/get-candidate-applications', getAppliedVacancies);

module.exports = router;
