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

// Profile Route
router.get('/get-user', getUserData);
router.get('/update-user', updateUser);

router.get('/vacancy', searchVacancies);
router.get('/vacancy-candidate', getCandidateVacancies);
//
router.get('/get-vacancy/:id', getVacancy);
router.get("/get-user", getUserData);
router.post("/update-user", updateUser);
router.post("/check-user-experiences", validation(updateUserExperiences), (req, res) => { return res.status(200).json({ success: true, message: 'Objeto válido' }); });
router.post("/check-user-formations", validation(updateUserFormations), (req, res) => { return res.status(200).json({ success: true, message: 'Objeto válido' }); });

router.post('/apply-vacancy', applyToVacancy);
router.post('/cancel-apply-vacancy', cancelApplyVacancy);
router.get('/get-candidate-applications', getAppliedVacancies);

module.exports = router;
