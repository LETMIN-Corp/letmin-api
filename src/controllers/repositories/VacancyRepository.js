const User = require('../../models/User');
const Vacancy = require('../../models/Vacancy');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Get candidate profile info, and the count of his applications (which is in the Vacancy model)
 */
async function getCandidateInfo(_id) {
	return await User.aggregate([
		{ $match: { _id: ObjectId(_id) } },
		{ $lookup: { from: 'vacancies', localField: '_id', foreignField: 'candidates', as: 'applications'} },
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
				username: 1,
				description: 1,
				applications: { $size: '$applications' },
			},
		},
	]);
}

/**
 * Get all vacancies that the candidate has applied to
 */
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
				closed: 1,
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

/*
 * Get all vacancies not closed to show to candidate
 * @param {string} search - search string
 **/
async function searchVacancies(user_id, search) {
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
					$in: [new ObjectId(user_id), '$candidates']
				},
				company: {
					_id: '$companyInfo._id', 
					name: '$companyInfo.company.name'
				}
			}
		}
	]);
}

/**
 * Get all candidates that applied to the vacancy (not blocked) 
 * and all possible matches of the system to the company
 * @param {string} _id - vacancy id
 * @return {object} - with the vacancy info and the candidates inside an array
 */
const getVacancyWithCandidates = async (_id) => {
	const { matchUsersWithVacancy } = require ('./MatchRepository');

	const vacancy = await Vacancy.findOne({ _id: ObjectId(_id) }).populate('company', 'company.name').lean();

	const MatchedUsers = await matchUsersWithVacancy(vacancy);

	const { checkUserCompatibility } = require ('./MatchRepository');

	const vacancy_candidates = await Vacancy.aggregate([
		{ $match: { _id: ObjectId(_id) } },
		{ $lookup: { from: 'users', localField: 'candidates', foreignField: '_id', as: 'candidates'} },
		{ $match: { 'candidates.blocked': false } },
		{
			$project: {
				_id: 1,
				role: 1,
				description: 1,
				sector: 1,
				views: 1,
				salary: 1,
				currency: 1,
				region: 1,
				candidates: {
					$map: {
						input: '$candidates',
						as: 'candidate',
						in: {
							_id: '$$candidate._id',
							name: '$$candidate.name',
							email: '$$candidate.email',
							picture: '$$candidate.picture',
						}
					}
				},
			},
		}
	]);

	let candidates = vacancy_candidates[0].candidates;

	for(let candidate of candidates) {
		// check if the user is within the matched users and if so, remove him from the matched users array
		const index = MatchedUsers.findIndex(user => user._id.toString() === candidate._id.toString());
		if (index > -1) {
			MatchedUsers.splice(index, 1);
		}
		
		candidate.compatibility = await checkUserCompatibility(candidate._id, vacancy._id);
	}
	for(let candidate of MatchedUsers) {
		candidate.compatibility = await checkUserCompatibility(candidate._id, vacancy._id);

		MatchedUsers[MatchedUsers.indexOf(candidate)] = {
			_id: candidate._id,
			name: candidate.name,
			picture: candidate.picture,
			compatibility: candidate.compatibility,
		};
	}

	return {
		...vacancy_candidates[0],
		candidates: candidates,
		matches: MatchedUsers,
	};
};

/**
 * Get Vacancy Info to show to company and candidate
 * @param {string} _id 
 * @returns 
 */
async function userGetVacancy(_id, user_id) {
	const vacancy = await Vacancy.aggregate([
		{ $match: { _id: ObjectId(_id), closed: false } },
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
				workload: 1,
				wantedSkills: 1,
				yearsOfExperience: 1,
				type: 1,
				candidates: {
					$size: '$candidates'
				},
				company: {
					_id: '$companyInfo._id',
					name: '$companyInfo.company.name'
				},
				user_applied: {
					$in: [new ObjectId(user_id), '$candidates']
				}
			}
		}
	]);

	// if vacancy exists, increment views
	if (vacancy.length > 0) {
		await Vacancy.updateOne({ _id: ObjectId(_id) }, { $inc: { views: 1 } });
	}

	return vacancy[0];
}

const companyGetVacancy = async (_id) => {
	const vacancy = await Vacancy.aggregate([
		{ $match: { _id: ObjectId(_id) } },
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
				workload: 1,
				wantedSkills: {
					$map: {
						input: '$wantedSkills',
						as: 'skill',
						in: {
							name: '$$skill.name',
							level: '$$skill.level'
						}
					}
				},
				yearsOfExperience: 1,
				type: 1,
				candidates: 1,
				number_candidates: {
					$size: '$candidates'
				},
				company: {
					_id: '$companyInfo._id',
					name: '$companyInfo.company.name'
				},
				
			}
		}
	]);

	return vacancy[0];
};

module.exports = {
	getCandidateInfo,
	getAppliedVacancies,
	searchVacancies,
	getVacancyWithCandidates,
	userGetVacancy,
	companyGetVacancy,
};