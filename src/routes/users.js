const router = require('express').Router();

const { updateUser, getUserData, updateUserExperiences, updateUserFormations } = require('../controllers/userController');
const { searchVacancies, getVacancy, applyToVacancy } = require('../controllers/vacancyController');

// Bring in the User Registration function
const {
	serializeUser
} = require('../utils/Auth');

// Profile Route
router.get('/profile', async (req, res) => {
	return res.json(serializeUser(req.user));
});

router.get('/vacancy', searchVacancies);
router.get('/get-vacancy/:id', getVacancy);
router.get("/get-user", getUserData);
router.post("/update-user", updateUser);
router.post("/update-user-experiences", updateUserExperiences);
router.post("/update-user-formations", updateUserFormations);
router.post('/apply-vacancy', applyToVacancy);

module.exports = router;
