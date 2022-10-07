const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;

// Vacancy CRUD
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

const getVacancy = async (req, res) => {
	try {
		// get vacancy and only one company
		Vacancy.findById(req.params.id).populate('company candidates', 'company.name')
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						success: false,
						message: 'Vaga não encontrada.',
					});
				}

				vacancy.views += 1;
				vacancy.save();

				return res.json({
					success: true,
					message: 'Vaga encontrada com sucesso',
					vacancy,
				});
			});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao buscar vaga' + err,
		});
	}
};

// Change vacancy status to the opposite
const confirmVacancy = async (req, res) => {
	try {
		Vacancy.findById(req.params.id)
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						success: false,
						message: 'Vaga não encontrada.',
					});
				}
			
				vacancy.closed = !vacancy.closed;
				vacancy.save();

				return res.json({
					success: true,
					message: 'Vaga atualizada com sucesso',
				});
			});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: 'Erro ao atualizar vaga' + err,
		});
	}
};

const closeVacancy = async (req, res) => {
	try {
		await Vacancy.findByIdAndDelete(req.params.id)
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
 * @route   GET api/users/search-vacancies/:search
 */
const searchVacancies = async (req, res) => {
	let search = req.params.search? req.params.search.trim() : '';

	Vacancy.find({
		$and: [
			{ closed: false },
			{
				$or: [
					{ role: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } },
					{ sector: { $regex: search, $options: 'i' } },
					{ 'company.name': { $regex: search, $options: 'i' } },
				],
			},
		],
	}).populate('company', 'company.name').select('role description sector region company candidates').sort({ createdAt: -1 })
		.then((vacancies) => { 
			if (!vacancies) {
				return res.status(404).json({
					success: false,
					message: 'Vaga não encontrada.',
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Vagas encotradas.',
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

const getAllCandidates = async (req, res) => {
	try {
		const vacancy = await Vacancy.findById(req.params.id)
			.select('candidates role')
			.populate('candidates', 'name email');

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Candidatos encontrados',
			data: {
				candidates: vacancy.candidates,
				role: vacancy.role
			}
		});
	} catch (err) {
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
	try {
		// get candidate profile info, and the count of his applications (which is in the Vacancy model)
		const candidate = await User.aggregate([
			{ $match: { _id: ObjectId(req.params.id) } },
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
	try {
		const vacancies = await Vacancy
			.aggregate([
				{ $match: { candidates: req.user._id } },
				{ $sort: { createdAt: -1 } },
				{ $project: { role: 1, description: 1, sector: 1, region: 1, company: 1, candidates: { $size: '$candidates' } } },
				{ $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' } },
				{ $unwind: '$company' },
				{ $project: { role: 1, description: 1, sector: 1, region: 1, company: '$company.name', candidates: 1 } }
			]);
			

		if (!vacancies || !vacancies.length) {
			return res.status(404).json({
				success: false,
				message: 'Vagas não encontradas.',
			});
		}

		return res.json({
			success: true,
			message: 'Vagas encontradas',
			data: vacancies
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
	getVacancy,
	confirmVacancy,
	closeVacancy,
	searchVacancies,
	applyToVacancy,
	getAllCandidates,
	getCandidate,
	getAppliedVacancies,
};
