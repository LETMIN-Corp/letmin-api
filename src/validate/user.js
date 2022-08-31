const Joi = require('joi');
const User = require("../models/User");

const userValidator = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': `Nome não pode ser vazio`,
        'any.required': `Nome é obrigatório`
    }),
    email: Joi.string().email().required().custom((value, helper) => {
        let user = await User.findOne({ value });
        return user ? helper.message("O email já foi cadastrado") : true;
    }).messages({
        'string.empty': `Email não pode ser vazio`,
        'any.required': `Email é obrigatório`,
        'string.email': `Email inválido`
    }),
    password: Joi.string().required().messages({
        'string.empty': `Senha não pode ser vazia`,
        'any.required': `Senha é obrigatória`
    }),
}).options({ abortEarly: false });

module.exports = userValidator;