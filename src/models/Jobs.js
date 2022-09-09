const { Schema, model } = require("mongoose");

const JobsSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    sector: {
        type: String,
        required: true,
        enum: ["Recursos Humanos", "Tecnologia", "Administrativo", "Financeiro", "Operacional"]
    },
    description: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum: ["Real", "Dolar", "Euro"]
    },
    workload: {
        type: String,
        required: true,
        enum: ["Integral", "Meio Período", "Home Office"]
    },
    region: {
        type: String,
        required: true,
        enum: ["Sul", "Sudeste", "Centro-Oeste", "Norte", "Nordeste"]
    },
    insertDate: {
        type: Date,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    candidates: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }],
    company: {
        type: Schema.Types.ObjectId,
        ref: "companies"
    }
});

module.exports = model("jobs", JobsSchema);