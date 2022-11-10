const Company = require('../models/Company');
const User = require('../models/User');
const Vacancy = require('../models/Vacancy');

const matchCandidates = async (req, res) => {
	const { vacancy_id } = req.body;

    try {
		const vacancy = await Vacancy.findById(vacancy_id);

        if (!vacancy) {
            return res.status(400).json({
                success: false,
                message: 'Vaga não encontrada.',
            });
        }

		const { matchUsersWithVacancy } = require('./repositories/MatchRepository');

		const candidates = await matchUsersWithVacancy(vacancy);

		if (!candidates.length) {
			return res.status(404).json({
				success: false,
				message: 'Nenhum candidato encontrado.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Candidatos encontrados.',
			candidates: candidates,
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