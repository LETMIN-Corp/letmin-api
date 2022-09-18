const router = require("express").Router();
const validation = require("../middlewares/validation");
const { vacancyValidator } = require("../validate/vacancy");
const { companyValidator, loginCompanySchema } = require("../validate/company");
const { 
    insertVacancy,
    getAllVacancies,
    getAllCompanyVacancies,
    getVacancy,
    confirmVacancy,
    searchVacancies,
    closeVacancy,
} = require("../controllers/vacancyController");
const { registerCompany, loginCompany, getCompanyData } = require("../controllers/companyController");

// Company Registration Route
router.post("/register-company", validation(companyValidator), registerCompany);

// Company Login Route
router.post("/login-company", validation(loginCompanySchema), loginCompany);

router.get("/company-data", getCompanyData);

// Vacancy Crud Routes
router.post("/register-vacancy", validation(vacancyValidator), insertVacancy);
router.get("/get-all-vacancies", getAllVacancies);
router.get("/get-company-vacancies", getAllCompanyVacancies);
router.get("/get-vacancy/:id", getVacancy);
router.get("/search-vacancies/:search?", searchVacancies);
router.patch("/confirm-vacancy/:id", confirmVacancy);
router.delete("/close-vacancy/:id", closeVacancy);

module.exports = router;