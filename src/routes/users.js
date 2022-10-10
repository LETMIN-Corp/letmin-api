const router = require('express').Router();

const { updateUser, getUserData, updateUserExperiences, updateUserFormations } = require('../controllers/userController');
const { 
	searchVacancies, 
	getCandidateVacancies,
	getVacancy, 
	applyToVacancy, 
	getAppliedVacancies,
	cancelApplyVacancy
} = require('../controllers/vacancyController');

// Profile Route
router.get('/get-user', getUserData);
router.get('/update-user', updateUser);

router.get('/vacancy', searchVacancies);
router.get('/vacancy-candidate', getCandidateVacancies);
//
router.get('/get-vacancy/:id', getVacancy);
router.get("/get-user", getUserData);
router.post("/update-user", updateUser);
router.post("/update-user-experiences", updateUserExperiences);
router.post("/update-user-formations", updateUserFormations);

router.post('/apply-vacancy', applyToVacancy);
router.post('/cancel-apply-vacancy', cancelApplyVacancy);
router.post('/get-all-applications', getAppliedVacancies);

module.exports = router;
