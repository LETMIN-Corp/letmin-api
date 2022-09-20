const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');
const ObjectId = require('mongoose').Types.ObjectId;
const {
	decodeToken,
	jwtSign,
	jwtVerify,
} = require('../utils/jwt');

function getCompanyId(req, res) {
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

	let _id = getCompanyId(req, res);

	try {
		const vacancy = new Vacancy({
			...req.body,
			company: _id,
		});

		await vacancy.save(async (err, vacancy) => {
			if (err) {
				return res.status(400).json({
					message: 'Error ' + err,
					success: false,
				});
			}
            
			const company = await Company.findById(_id);

			company.vacancies.push(vacancy._id);

			await company.save();

			return res.json({
				message: 'Vaga criada com sucesso',
				success: true,
				vacancy,
			});

		});

	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

const getAllCompanyVacancies = async (req, res) => {
	try {
		let company = getCompanyId(req, res);

		const values = await Company.findById(company).populate('vacancies').select('vacancies -_id');

		return res.json({
			message: 'Vagas encontradas com sucesso',
			success: true,
			vacancies: values.vacancies,
		});
	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

const getVacancy = async (req, res) => {
	try {
		let company = getCompanyId(req, res);

		// get vacancy and only one company
		Vacancy.findById(req.params.id).populate('company', 'company.name')
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						message: 'Vaga não encontrada.',
						success: false
					});
				}
            
				vacancy.views += 1;
				vacancy.save();

				return res.json({
					message: 'Vaga encontrada com sucesso',
					success: true,
					vacancy,
				});
			});
	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

const confirmVacancy = async (req, res) => {
	try {
		let company = getCompanyId(req, res);

		await Vacancy.findByIdAndUpdate(req.params.id, {
			closed: true,
		}).then((vacancy) => {
			if (!vacancy) {
				return res.status(404).json({
					message: 'Vaga não encontrada.',
					success: false
				});
			}

			return res.json({
				message: 'Vaga confirmada com sucesso',
				success: true,
				vacancy,
			});
		});

	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

const closeVacancy = async (req, res) => {
	try {
		let company = getCompanyId(req, res);

		await Vacancy.findByIdAndDelete(req.params.id)
			.then((vacancy) => {
				if (!vacancy) {
					return res.status(404).json({
						message: 'Vaga não encontrada.',
						success: false
					});
				}
				return res.json({
					message: 'Vaga excluída com sucesso',
					success: true,
				});
			});
	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

const getAllVacancies = async (req, res) => {
	try {
		const vacancies = await Vacancy.find();
		return res.json({
			success: true,
			vacancies,
		});
	} catch (err) {
		return res.status(400).json({
			message: err,
			success: false,
		});
	}
};

/**
 * Search vacancies by role, description, sector and company name
 * @route   GET api/users/search-vacancies/:search
 */
const searchVacancies = async (req, res) => {
	let company = getCompanyId(req, res);

	let search = req.params.search || '';

	Company.find({
		$or: [
			{ 'vacancies.role': { $regex: search, $options: 'i' } },
			{ 'vacancies.description': { $regex: search, $options: 'i' } },
			{ 'vacancies.sector': { $regex: search, $options: 'i' } },
			{ 'company.name': { $regex: search, $options: 'i' } },
		]
	}).populate('vacancies').select('vacancies -_id')
		.then((vacancies) => { 
			if (!vacancies) {
				return res.status(404).json({
					message: 'Vaga não encontrada.',
					success: false
				});
			}
			return res.status(200).json({
				// put all vacancies in one array
				vacancies:vacancies.reduce((acc, val) => acc.concat(val.vacancies), []),
				message: 'Vagas encotradas.',
				success: true
			});
		})
		.catch((err) => {
			return res.status(400).json({
				message: err,
				success: false,
			});
		});
};

module.exports = {
	insertVacancy,
	getAllVacancies,
	getAllCompanyVacancies,
	getVacancy,
	confirmVacancy,
	closeVacancy,
	searchVacancies,
};
