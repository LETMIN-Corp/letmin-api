const { Schema, model } = require("mongoose");

const CompanySchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    company_email: {
        type: String,
        required: true
    },
    company_cnpj: {
        type: String,
        required: true
    },
    company_phone: {
        type: String,
        required: true
    },
    company_address: {
        type: String,
        required: true
    },
    holder_name: {
        type: String,
        required: true
    },
    holder_cpf: {
        type: String,
        required: true
    },
    holder_email: {
        type: String,
        required: true
    },
    holder_phone: {
        type: String,
        required: true
    },
    holder_password: {
        type: String,
        required: true
    },
    holder_confirmPassword: {
        type: String,
        required: true
    },
    plan_types: {
        type: String,
        required: true
    },
    card_type: {
        type: String,
        required: true
    }
});

module.exports = model("companies", CompanySchema);
 