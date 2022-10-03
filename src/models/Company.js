const { Schema, model } = require('mongoose');

const CompanySchema = new Schema({
	company: {
		name: {
			type: String,
			required: true
		},
		cnpj: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		},
		address: {
			type: String,
			required: true
		},
	},
	holder: {
		name: {
			type: String,
			required: true
		},
		cpf: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
	},
	plan: {
		selected: {
			type: String,
			required: true
		},
	},
	card: {
		type: {
			type: String,
			required: true
		},
		number: {
			type: String,
			required: true
		},
		code: {
			type: String,
			required: true
		},
		expiration: {
			type: String,
			required: true
		},
		owner: {
			type: String,
			required: true
		},
	},
	vacancies: [{
		type: Schema.Types.ObjectId,
		ref: 'Vacancy',
	}],
	status: {
		blocked: {
			type: Boolean,
			required: true,
			default: false
		},
		reason: {
			type: String,
			required: false
		},
	},
	talentBank: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
});

module.exports = model('Company', CompanySchema, 'companies');
 