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
                role: 1,
                description: 1,
                applications: { $size: '$applications' },
            },
        },
    ]);
}

async function getAppliedVacancies (_id) {
    return await Vacancy.aggregate([
        { $match: { candidates: _id }}, 
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'companyInfo'} },
        { $unwind: { path: '$companyInfo' } },
        {
            $project: {
                role: 1, 
                description: 1, 
                sector: 1, 
                views: 1, 
                salary: 1, 
                currency: 1, 
                region: 1, 
                candidates: {
                    $size: '$candidates'
                }, 
                company: {
                    _id: '$companyInfo._id', 
                    name: '$companyInfo.company.name'
                }
            }
        }
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
        { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'companyInfo'} },
        { $unwind: { path: '$companyInfo' } },
        {
            $project: {
                role: 1, 
                description: 1, 
                sector: 1, 
                views: 1, 
                salary: 1, 
                currency: 1, 
                region: 1, 
                candidates: {
                    $size: '$candidates'
                },
                user_applied: {
                    $in: [new ObjectId('63460be3b642d29bb6d224df'), '$candidates']
                },
                company: {
                    _id: '$companyInfo._id', 
                    name: '$companyInfo.company.name'
                }
            }
        }
    ]);
}

module.exports = {
    getCandidateInfo,
    getAppliedVacancies,
    searchVacancies,
};