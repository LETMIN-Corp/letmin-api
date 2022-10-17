const { Schema, model } = require('mongoose');

const VacancySchema = new Schema({
	role: {
		index: true,
		type: String,
		required: true
	},
	sector: {
		index: true,
		type: String,
		required: true,
		enum: ['Recursos Humanos', 'Tecnologia', 'Administrativo', 'Financeiro', 'Operacional', 'Comércio', 'Serviços', 'Saúde', 'Industrial', 'Construção'],
	},
	description: {
		index: true,
		type: String,
		required: true
	},
	views: {
		type: Number,
		default: 0
	},
	salary: {
		type: String,
		required: true
	},
	currency: {
		type: String,
		required: true,
		enum: ['Real', 'Dolar', 'Euro']
	},
	workload: {
		type: String,
		required: true,
		enum: ['Integral', 'Meio Período', 'Home Office']
	},
	type: {
		type: String,
		required: true,
		enum: ['Estágio', 'Permanente', 'Temporário']
	},
	region: {
		type: String,
		required: true,
		enum: ['Sul', 'Sudeste', 'Centro-Oeste', 'Norte', 'Nordeste']
	},
	wantedSkills: [{
		name: {
			type: String,
		},
		level: {
			type: String,
			enum: ['Iniciante', 'Intermediário', 'Avançado'],
		},
	}],
	yearsOfExperience: {
		type: Number,
		required: true
	},
	candidates: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	company: {
		required: true,
		type: Schema.Types.ObjectId,
		ref: 'Company'
	},
	closed: {
		type: Boolean,
		default: false
	},
},
{
	timestamps: true
}
);

/**
 * Find vacancy with the same id and that is from the company_id and toggle it to the opposite value
 * @param {string} vacancy_id 
 * @param {string} company_id 
 * @returns {Promise<Vacancy>}
 */
VacancySchema.statics.findByIdAndToggleClosed = async function(vacancy_id, company_id) {
	return this.findOne({ _id: vacancy_id, company: company_id })
		.then(vacancy => {
			if (!vacancy) {
				return Promise.reject({
					status: 404,
					message: 'Vaga não encontrada'
				});
			}
			vacancy.closed = !vacancy.closed;
			return vacancy.save();
		});
};

module.exports = model('Vacancy', VacancySchema, 'vacancies');