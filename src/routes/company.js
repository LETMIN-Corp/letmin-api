const router = require("express").Router();
const validation = require("../middlewares/validation");
const { jobsValidator } = require("../validate/jobs");
const { companyValidator, loginCompanySchema } = require("../validate/company");
const { insertVacancy, getVacancies, getVacancy, confirmVacancy, closeVacancy } = require("../controllers/vacancyController");
const { registerCompany, loginCompany } = require("../controllers/companyController");

// Company Registration Route
router.post("/register-company", validation(companyValidator), registerCompany);

// Company Login Route
router.post("/login-company", validation(loginCompanySchema), loginCompany);

// Vacancy Crud Routes
router.post("/register-vacancy", validation(jobsValidator), insertVacancy);
router.get("/get-vacancies", getVacancies);
router.get("/get-vacancy/:id", getVacancy);
router.patch("/confirm-vacancy/:id", confirmVacancy);
router.delete("/close-vacancy/:id", closeVacancy);

module.exports = router;