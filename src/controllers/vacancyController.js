const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');
const Log = require('../models/Log');

/**
 * Insert a new vacancy in the database
 * @route POST api/company/register-vacancy
 * @body {Vacancy} vacancy
 * @returns 
 */
const insertVacancy = async (req, res) => {
	let _id = req.user._id;

	try {
		const vacancy = new Vacancy({
			...req.body,
			company: _id,
		});

		vacancy.save(async (err, vacancy) => {
			if (err) {
				return res.status(400).json({
					success: false,
					message: 'Error ' + err,
				});
			}
            
			const company = await Company.findById(_id);

			company.vacancies.push(vacancy._id);

			await company.save();

			return res.json({
				success: true,
				message: 'Vaga criada com sucesso',
				vacancy,
			});

		});

	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao criar vaga' + err,
		});
	}
};

/**
 * GEt all vacancies from one Company
 */
const getAllCompanyVacancies = async (req, res) => {
	try {
		let _id = req.user._id;

		const values = await Company.findById(_id).populate('vacancies').select('vacancies -_id');

		return res.json({
			success: true,
			message: 'Vagas encontradas com sucesso',
			vacancies: values.vacancies,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vagas' + err,
		});
	}
};

/**
 * Get one vacancy from id populating the company name and all candidates
 * @route GET api/company/get-vacancy/:id
 * @route GET api/user/get-vacancy/:id
 */
const userGetVacancy = async (req, res) => {

	const { userGetVacancy } = require('./repositories/VacancyRepository');

	try {
		const vacancy = await userGetVacancy(req.params.id, req.user._id);
		
		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Vaga encontrada com sucesso',
			vacancy: vacancy,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vaga' + err,
		});
	}
};

/**
 * Change vacancy status to the opposite
 * @route PATCH api/company/confirm-vacancy/:id
 * @param {id} vacancy id
 * @returns 
 */
const confirmVacancy = async (req, res) => {
	if (!req.params.id) {
		return res.status(400).json({
			success: false,
			message: 'Id não informado',
		});
	}
	const companyId = req.user._id;

	try {
		const result = await Vacancy.findByIdAndToggleClosed(req.params.id, companyId);

		if (!result) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Vaga atualizada com sucesso',
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao atualizar vaga' + err,
		});
	}
};

// remove vacancy
const closeVacancy = async (req, res) => {
	const companyId = req.user._id;

	try {
		await Vacancy.findOneAndDelete({ company: companyId, _id: req.params.id })
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						success: false,
						message: 'Vaga não encontrada.',
					});
				}
				return res.json({
					success: true,
					message: 'Vaga excluída com sucesso',
				});
			});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao excluir vaga' + err,
		});
	}
};

/**
 * Update vacancy
 * @route PATCH api/company/update-vacancy
 * @body VacancyModel
 */
const updateVacancy = async (req, res) => {
	const companyId = req.user._id;
	const vacancyId = req.body._id;

	try {
		Vacancy.findOneAndUpdate({ company: companyId, _id: vacancyId }, req.body, { new: true })
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						success: false,
						message: 'Vaga não encontrada.',
					});
				}

				return res.json({
					success: true,
					message: 'Vaga atualizada com sucesso',
					vacancy,
				});
			});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao atualizar vaga' + err,
		});
	}
};

/**
 * Get all vacancies from one company
 * @route GET api/company/get-all-vacancies
 */
const getVacanciesCompany = async (req, res) => {

	let _id = req.user._id;

	try {
		const vacancies = await Vacancy.find({ company: _id }).populate('candidates', 'name email');
		return res.json({
			success: true,
			vacancies,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vagas' + err,
		});
	}
};

/**
 * Search vacancies by role, description, sector, region and company name not including closed ones
 * and sort by date and include candidates if the user is one of them
 * @route GET api/users/search-vacancies/:search
 */
const searchVacancies = async (req, res) => {
	let search = req.params.search? req.params.search.trim() : '';

	const { searchVacancies } = require('./repositories/VacancyRepository');

	try {
		const vacancies = await searchVacancies(req.user._id, search);

		if (!vacancies) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Vagas encontradas.',
			vacancies: vacancies
		});
	} catch(err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vagas.' + err,
		});
	}
};

/**
 * Get all vacancies where the user is a candidate
 * @param {*} req 
 * @param {*} res 
 */
const getCandidateVacancies = async (req, res) => {
	const user_id = req.user._id;

	Vacancy.find({
		$and: [
			{ candidates: user_id },
		],
	}).populate('company', 'company.name').select('role description sector region company').sort({ createdAt: -1 })
		.then((vacancies) => { 
			if (!vacancies) {
				return res.status(404).json({
					success: false,
					message: 'Vaga não encontrada.',
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Vagas encontradas.',
				vacancies: vacancies
			});
		})
		.catch((err) => {
			return res.status(400).json({
				success: false,
				message: 'Erro ao buscar vagas.' + err,
			});
		});
};

const applyToVacancy = async (req, res) => {
	try {
		const { vacancy_id } = req.body;

		const user_id = req.user._id;

		const vacancy = await Vacancy.findById(vacancy_id);

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		if (vacancy.candidates.includes(user_id)) {
			return res.status(400).json({
				success: false,
				message: 'Você já se candidatou a essa vaga.',
			});
		}

		vacancy.candidates.push(user_id);
		vacancy.save();

		return res.json({
			success: true,
			message: 'Candidatura realizada com sucesso',
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao se candidatar a vaga.' + err,
		});
	}
};

const cancelApplyVacancy = async (req, res) => {
	try {
		const { vacancy_id } = req.body;

		const user_id = req.user._id;

		const vacancy = await Vacancy.findById(vacancy_id);

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		if (vacancy.candidates.includes(user_id)) 
		{
			let index = vacancy.candidates.indexOf(user_id);
			vacancy.candidates.splice(index, 1);
			vacancy.save();

			return res.json({
				success: true,
				message: 'Descandidatura realizada com sucesso',
			});
		}
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao se candidatar a vaga.' + err,
		});
	}
};

/**
 * Get all candidates from one vacancy
 * @route /get-vacancy-candidates/:id
 * 
 * @param {string} id vacancy id
 **/
const getAllCandidates = async (req, res) => {

	const { getVacancyWithCandidates } = require('./repositories/VacancyRepository');

	try {
		let vacancy = await getVacancyWithCandidates(req.params.id);

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Candidatos encontrados',
			data: vacancy
		});
	} catch (err) {
		// Create a log
		await new Log({
			action: 'Read',
			description: `O Match de candidatos da vaga falhou: ${err}`,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		}).save();

		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar candidatos.' + err,
		});
	}
};

/**
 * Get candidate info by id
 * @route GET api/company/get-candidate/:id
 */
const getCandidate = async (req, res) => {
	const { getCandidateInfo } = require('./repositories/VacancyRepository');

	try {
		const candidate = await getCandidateInfo(req.params.id);

		if (!candidate || !candidate.length) {
			return res.status(404).json({
				success: false,
				message: 'Candidato não encontrado.',
			});
		}

		return res.json({
			success: true,
			message: 'Candidato encontrado',
			data: candidate[0]
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar candidato.' + err,
		});
	}
};

// Get all vacancies the user applied to sorting by date and counting the number of candidates
const getAppliedVacancies = async (req, res) => {
	const { getAppliedVacancies } = require('./repositories/VacancyRepository');
	try {
		const vacancies = await getAppliedVacancies(req.user._id);

		if (!vacancies || !vacancies.length) {
			return res.status(404).json({
				success: false,
				message: 'Vagas não encontradas.',
			});
		}

		return res.json({
			success: true,
			message: 'Vagas encontradas',
			vacancies: vacancies
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vagas.' + err,
		});
	}
};

module.exports = {
	insertVacancy,
	getVacanciesCompany,
	getAllCompanyVacancies,
	userGetVacancy,
	confirmVacancy,
	closeVacancy,
	updateVacancy,
	searchVacancies,
	getCandidateVacancies,
	applyToVacancy,
	cancelApplyVacancy,
	getAllCandidates,
	getCandidate,
	getAppliedVacancies,
};
