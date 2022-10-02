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
        type: Schema.Types.ObjectId,
        refPath: 'envoyType',
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        refPath: 'targetType',
        required: true
    },
    envoyType: {
        type: String,
        enum: ['User', 'Company', 'Admin'],
        required: true
    },
    targetType: {
        type: String,
        enum: ['User', 'Company'],
        required: true,
    },
    pending: {
        type: Boolean,
        default: true,
        required: true
    },
});

module.exports = model('Complaint', ComplaintSchema, 'complaints')