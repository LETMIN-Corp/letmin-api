const router = require('express').Router();

require('dotenv').config();

const { userLogin, getUserData, updateUser } = require("../controllers/userController");
const { searchVacancies } = require("../controllers/vacancyController");

// Bring in the User Registration function
const {
	passportAuth,
	checkRole,
	serializeUser
} = require('../utils/Auth');
const { USER } = require('../utils/constants');

// Users Registeration Route
router.post('/login-user', userLogin);
// Profile Route
router.get('/profile', passportAuth, checkRole(USER), async (req, res) => {
	return res.json(serializeUser(req.user));
});

router.get("/vacancy", searchVacancies);
router.get("/get-user", passportAuth, getUserData);
router.get("/update-user", passportAuth, updateUser);

module.exports = router;
