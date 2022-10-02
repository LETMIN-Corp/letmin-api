const router = require('express').Router();

const { 
	getAllCompanies,
	changeCompanyBlockStatus,
	getAllUsers,
	changeUserBlockStatus,
	getAllComplaints,
	changeComplaintStatus,
	removeComplaint,
} = require('../controllers/adminController');

// Companies Management Routes
router.get('/get-all-companies', getAllCompanies);
router.patch('/company-block', changeCompanyBlockStatus);

// Users Management Routes
router.get('/get-all-users', getAllUsers);
router.patch('/user-block', changeUserBlockStatus);

router.get('/get-all-complaints', getAllComplaints);
router.patch('/resolve-complaint', changeComplaintStatus);
router.delete('/remove-complaint', removeComplaint);

module.exports = router;