const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');
const ObjectId = require('mongoose').Types.ObjectId;
const {
	decodeToken,
	jwtSign,
	jwtVerify,
} = require('../utils/jwt');
const User = require('../models/User');

// Vacancy CRUD
const insertVacancy = async (req, res) => {
	let _id = req.user._id;

	try {
		const vacancy = new Vacancy({
			...req.body,
			company: _id,
		});

		await vacancy.save(async (err, vacancy) => {
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
			message: err,
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
			message: err,
		});
	}
};

const getVacancy = async (req, res) => {
	try {
		// get vacancy and only one company
		Vacancy.findById(req.params.id).populate('company', 'company.name')
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
			message: err,
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
			message: err,
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
			message: err,
		});
	}
};

/**
 * Get all vacancies from one company
 * @route GET api/company/get-all-vacancies
 */
const getAllVacancies = async (req, res) => {

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
			message: err,
		});
	}
};

/**
 * Search vacancies by role, description, sector and company name not including closed ones
 * @route   GET api/users/search-vacancies/:search
 */
const searchVacancies = async (req, res) => {
	let search = req.params.search || '';

	Vacancy.find({
		$and: [
			{
				$or: [
					{ role: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } },
					{ sector: { $regex: search, $options: 'i' } },
				],
			},
			{ closed: false },
		],
	}).populate('company', 'company.name').select('role description sector region company')
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
				message: err,
			});
		});
};

const applyToVacancy = async (req, res) => {
	try {
		const { vacancy_id } = req.body;

		const user_id = req.user._id

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
			message: err,
		});
	}
};

const getAllCandidates = async (req, res) => {
	try {
		const vacancy = await Vacancy.findById(req.params.id).populate('candidates', 'name email');

		if (!vacancy) {
			return res.status(404).json({
				success: false,
				message: 'Vaga não encontrada.',
			});
		}

		return res.json({
			success: true,
			message: 'Candidatos encontrados',
			candidates: vacancy.candidates,
		});
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: err,
		});
	}
};

module.exports = {
	insertVacancy,
	getAllVacancies,
	getAllCompanyVacancies,
	getVacancy,
	confirmVacancy,
	closeVacancy,
	searchVacancies,
	applyToVacancy,
	getAllCandidates,
};
