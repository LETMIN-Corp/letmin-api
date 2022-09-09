const router = require("express").Router();
const validation = require("../middlewares/validation");
const { jobsValidator } = require("../validate/jobs");
const { companyValidator, loginCompanySchema } = require("../validate/company");
const { insertJob, getJobs, getJob, updateJob, deleteJob } = require("../controllers/jobsController");
const { registerCompany, loginCompany } = require("../controllers/companyController");

// Company Registration Route
router.post("/register-company", validation(companyValidator), registerCompany);

// Company Login Route
router.post("/login-company", validation(loginCompanySchema), loginCompany);

// Vacancy Crud Routes
router.post("/register-vacancy", validation(jobsValidator), insertJob);
router.get("/get-vacancies", getJobs);
router.get("/get-vacancy/:id", getJob);
router.patch("/update-vacancy/:id", updateJob);
router.delete("/delete-vacancy/:id", deleteJob);

module.exports = router;