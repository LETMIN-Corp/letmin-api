const Vacancy = require('../models/Vacancy');
const ObjectId = require('mongoose').Types.ObjectId;
const {
    decodeToken,
    jwtSign,
    jwtVerify,
} = require('../utils/jwt');

function getCompanyId(req) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            message: 'Unauthorized',
            success: false,
        });
    }

    // get company_id from jwt authorization header
    let jwt = req.headers.authorization;

    let company_id = decodeToken(jwt).user_id;

    let company = new ObjectId(company_id);

    return company;
}

// Vacancy CRUD
const insertVacancy = async (req, res) => {

    let company = getCompanyId(req);

    try {
        const job = new Vacancy({
            ...req.body,
            company,
        });

        await job.save();
        return res.json({
            message: 'Job inserted successfully',
            success: true,
            job,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
};

const getAllVacancies = async (req, res) => {

    let company = getCompanyId(req);

    try {
        const vacancies = await Vacancy.find({ company });
        return res.json({
            message: 'Vacancy fetched successfully',
            success: true,
            vacancies,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const getVacancy = async (req, res) => {

    let company = getCompanyId(req);

    try {
        const job = await Vacancy.findById(req.params.id);
        return res.json({
            message: 'Job fetched successfully',
            success: true,
            job,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const confirmVacancy = async (req, res) => {

    let company = getCompanyId(req);

    try {
        // update vacancy closed to true
        const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, {
            closed: true,
        });
        return res.json({
            message: 'Vacancy confirmed successfully',
            success: true,
            vacancy,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const closeVacancy = async (req, res) => {
    try {
        await Vacancy.findByIdAndDelete(req.params.id);
        return res.json({
            message: 'Job deleted successfully',
            success: true,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

module.exports = {
    insertVacancy,
    getAllVacancies,
    getVacancy,
    confirmVacancy,
    closeVacancy,
};
