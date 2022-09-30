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
        ref: 'User' || 'Company',
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        ref: 'User' || 'Company',
        required: true
    },
    typeof: {
        type: String,
        required: true,
        enum: ['user', 'company']
    },
    status: {
        type: String,
        required: true,
        default: 'Pendente',
        enum: ['Pendente', 'Resolvido'],
    },
});

module.exports = model('Complaint', ComplaintSchema, 'complaints')