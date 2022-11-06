const router = require('express').Router();

const { 
	userGetVacancy, 
} = require('../controllers/vacancyController');

const { 
	getAllCompanies,
	changeCompanyBlockStatus,
	getAllUsers,
	changeUserBlockStatus,
	getAllComplaints,
	changeComplaintStatus,
	removeComplaint,
	getUser,
	getCompany,
} = require('../controllers/adminController');

// Companies Management Routes
router.get('/get-all-companies', getAllCompanies);
router.patch('/company-block', changeCompanyBlockStatus);

// Users Management Routes
router.get('/get-all-users', getAllUsers);
router.patch('/user-block', changeUserBlockStatus);

router.get('/get-all-companies', getAllCompanies);
router.patch('/company-block', changeCompanyBlockStatus);

router.get('/get-all-users', getAllUsers);
router.patch('/user-block', changeUserBlockStatus);
router.get('/get-all-complaints', getAllComplaints);
router.patch('/resolve-complaint', changeComplaintStatus);
router.delete('/remove-complaint', removeComplaint);

router.post('/get-user', getUser);
router.post('/get-company', getCompany);

router.get('/get-vacancy/:id', userGetVacancy);

module.exports = router;