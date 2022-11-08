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
	getAllLogs,
	cleanLogs,
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

router.get('/get-all-logs', getAllLogs);
router.delete('/delete-all-logs', cleanLogs);

module.exports = router;