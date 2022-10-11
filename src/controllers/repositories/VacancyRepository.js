const User = require("../../models/User");
const Vacancy = require("../../models/Vacancy");
const ObjectId = require('mongoose').Types.ObjectId;

// get candidate profile info, and the count of his applications (which is in the Vacancy model)
async function getCandidateInfo(_id) {
    return await User.aggregate([
        { $match: { _id: ObjectId(_id) } },
        {
            $lookup: {
                from: 'vacancies',
                localField: '_id',
                foreignField: 'candidates',
                as: 'applications',
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                picture: 1,
                formations: 1,
                experiences: 1,
                phone: 1,
                createdAt: 1,
                updatedAt: 1,
                applications: { $size: '$applications' },
            },
        },
    ]);
}

async function getAppliedVacancies (_id) {
    return await Vacancy.aggregate([
        { $match: { candidates: ObjectId(_id) } },
        { $sort: { createdAt: -1 } },
        { $project: { role: 1, description: 1, sector: 1, region: 1, company: 1, candidates: { $size: '$candidates' } } },
        { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' } },
        { $unwind: '$company' },
        { $project: { role: 1, description: 1, sector: 1, region: 1, company: '$company.name', candidates: 1 } }
    ]);
}

async function searchVacancies(search) {
    return await Vacancy.aggregate([
        { $match: { closed: false } },
        {
            $match: {
                $or: [
                    { role: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { sector: { $regex: search, $options: 'i' } },
                    { 'company.name': { $regex: search, $options: 'i' } },
                ],
            },
        },
        { $sort: { createdAt: -1 } },
        { $project: { role: 1, description: 1, sector: 1, region: 1, company: 1, candidates: { $size: '$candidates' } } },
        { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' } },
        { $unwind: '$company' },
        { $project: { role: 1, description: 1, sector: 1, region: 1, company: '$company.name', candidates: 1 } },
    ]);
}

module.exports = {
    getCandidateInfo,
    getAppliedVacancies,
    searchVacancies,
};