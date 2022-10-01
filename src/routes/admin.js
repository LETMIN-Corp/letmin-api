const router = require('express').Router();

const { 
	getAllCompanies,
	changeCompanyBlockStatus,
	getAllUsers,
	changeUserBlockStatus,
	getAllComplaints,
	changeComplaintStatus,
} = require('../controllers/adminController');

// Companies Management Routes
router.get('/get-all-companies', getAllCompanies);
router.patch('/company-block', changeCompanyBlockStatus);

// Users Management Routes
router.get('/get-all-users', getAllUsers);
router.patch('/user-block', changeUserBlockStatus);

router.get('/get-all-complaints', getAllComplaints);
router.get('/resolve-complaint/:id', changeComplaintStatus)

module.exports = router;