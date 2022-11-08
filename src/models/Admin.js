const { Schema, model } = require('mongoose');

const AdminSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		lastLogin: {
			type: Date,
			required: false,
			default: Date.now
		},
		active: {
			type: Boolean,
			required: true,
			default: true
		}
	},
	{ timestamps: true }
);

module.exports = model('Admin', AdminSchema, 'admins');
