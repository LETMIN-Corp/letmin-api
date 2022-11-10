const { Schema, model } = require('mongoose');

const LogsSchema = new Schema({
    action: {
        type: String,
        required: true,
        //enum: ['Create', 'Update', 'Delete']
    },
    target: {
        foreignKey: {
            ref: 'User' || 'Company' || 'Admin' || 'Complaint',
            type: Schema.Types.ObjectId,
            required: false,
        },
        role: {
            type: String,
            required: false,
            enum: ['User', 'Company', 'Admin', 'Complaint']
        }
    },
    description: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

module.exports = model('Logs', LogsSchema, 'logs');