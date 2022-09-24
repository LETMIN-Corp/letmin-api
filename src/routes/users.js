const router = require('express').Router();

const { searchVacancies, getVacancy } = require('../controllers/vacancyController');

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

module.exports = router;
