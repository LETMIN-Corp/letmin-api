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

module.exports = model('Vacancy', VacancySchema, 'vacancies');