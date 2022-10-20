const Company = require('../models/Company');
const User = require('../models/User');
const Vacancy = require('../models/Vacancy');

const matchCandidates = async (req, res) => {
	const { vacancy_id } = req.body;
	console.log(vacancy_id);
	try {
		// find the vacancy
		const vacancy = await Vacancy.findById(vacancy_id);

		// find candidates that match the vacancy requirements
		// based on skills, years of experience, user role and their description
		const candidates = await User.find({
			skills: { $in: vacancy.wantedSkills.name },
			role: vacancy.role,
			$or: [
				{ yearsOfExperience: { $gte: vacancy.yearsOfExperience } },
				{ description: { $regex: vacancy.description, $options: 'i' } },
				{ role: { $regex: vacancy.role, $options: 'i' } },
				//{ skills: { $regex: vacancy.skills, $options: 'i' } },
			],
			//'skills.name': { $regex: vacancy.wantedSkills.name, $options: 'i' },

			yearsOfExperience: { $gte: vacancy.yearsOfExperience },
		});

		// find the company
		const company = await Company.findById(vacancy.company);

		if (!candidates || !candidates.length) {
			return res.status(404).json({
				success: false,
				message: 'Nenhum candidato encontrado.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Candidatos encontrados.',
			candidates: candidates,
			//company: company,
		});

	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error ' + err,
		});
	}
    
};

module.exports = {
	matchCandidates,
};