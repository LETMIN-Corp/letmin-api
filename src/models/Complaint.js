const { required } = require('joi');
const { Schema, model } = require('mongoose');

const ComplaintSchema = new Schema({
	reason: {
		type: String,
		required: true,
		enum: ['Conteúdo Inapropriado', 'Spam', 'Outro']
	},
	description: {
		type: String,
		required: true
	},
	envoy: {
		foreignKey: {
			ref: 'User' || 'Company' || 'Admin',
			type: Schema.Types.ObjectId,
			required: true
		},
		role: {
			type: String,
			required: true,
			enum: ['User', 'Company', 'Admin']
		}
	},
	target: {
		foreignKey: {
			ref: 'User' || 'Company',
			type: Schema.Types.ObjectId,
			required: true
		},
		role: {
			type: String,
			required: true,
			enum: ['User', 'Company']
		}
	},
	pending: {
		type: Boolean,
		default: true,
		required: true
	},
},
{
	timestamps: true
});

module.exports = model('Complaint', ComplaintSchema, 'complaints');