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
		// find candidates that match the vacancy requirements
		// based on skills, years of experience, user role and their description
        console.log(vacancy);

		descriptionSpliced = vacancy.description.trim().split(' ');

		const candidates = await User.find({
			$text: { $search: vacancy.description },
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