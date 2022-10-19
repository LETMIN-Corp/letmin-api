const { Schema, model } = require('mongoose');
const SALT_WORK_FACTOR = 10;
const bcrypt = require('bcryptjs');

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
		description: {
			type: String,
			default: '',
			required: false,
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
	forgotPassword: [
		{
			selector: {
				type: String,
				required: true
			},
			token: {
				type: String,
				required: false
			},
			createdAt: {
				type: Date,
				required: false
			},
			ip: {
				type: String,
				required: false
			},
			used: {
				type: Boolean,
				required: true,
				default: false
			},
		}
	],
	talentBank: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
});

// pre insert hook
CompanySchema.pre('save', async function (next) {
	var company = this;
	// only hash the password if it has been modified (or is new)
	if (!company.isModified('holder.password')) return next();
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);
        
		// hash the password using our new salt
		bcrypt.hash(company.holder.password, salt, function(err, hash) {
			if (err) return next(err);
			// override the cleartext password with the hashed one
			company.holder.password = hash;
			next();
		});
	});
});

module.exports = model('Company', CompanySchema, 'companies');
 