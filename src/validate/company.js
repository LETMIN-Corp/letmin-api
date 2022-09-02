const Joi = require('joi');

const companyValidator = Joi.object({
    company_name: Joi.string().required().messages({
        'string.empty': `Nome da empresa não pode ser vazio`,
        'any.required': `Nome da empresa é obrigatório`
    }),
    company_cnpj: Joi.string().required().regex(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}$/).messages({
        'string.empty': `CNPJ não pode ser vazio`,
        'any.required': `CNPJ é obrigatório`,
        'string.pattern.base': `CNPJ inválido`
    }),
    company_email: Joi.string().email().required().messages({
        'string.empty': `Email não pode ser vazio`,
        'any.required': `Email é obrigatório`,
        'string.email': `Email inválido`
    }),
    company_phone: Joi.string().required().regex(/^\([0-9]{2}\)[0-9]{5}\-[0-9]{4}$/).messages({
        'string.empty': `Telefone não pode ser vazio`,
        'any.required': `Telefone é obrigatório`,
        'string.pattern.base': `Telefone inválido`
    }),
    company_address: Joi.string().required().messages({
        'string.empty': `Endereço não pode ser vazio`,
        'any.required': `Endereço é obrigatório`
    }),
    holder_name: Joi.string().required().messages({
        'string.empty': `Nome do responsável não pode ser vazio`,
        'any.required': `Nome do responsável é obrigatório`
    }),
    holder_cpf: Joi.string().required().regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$/).messages({
        'string.empty': `CPF não pode ser vazio`,
        'any.required': `CPF é obrigatório`,
        'string.pattern.base': `CPF inválido`
    }),
    holder_email: Joi.string().email().required().messages({
        'string.empty': `Email não pode ser vazio`,
        'any.required': `Email é obrigatório`,
        'string.email': `Email inválido`
    }),
    holder_phone: Joi.string().required().regex(/^\([0-9]{2}\)[0-9]{5}\-[0-9]{4}$/).messages({
        'string.empty': `Telefone não pode ser vazio`,
        'any.required': `Telefone é obrigatório`,
        'string.pattern.base': `Telefone inválido`
    }),
    holder_password: Joi.string().required().messages({
        'string.empty': `Senha não pode ser vazia`,
        'any.required': `Senha é obrigatória`
    }),
    holder_confirmPassword: Joi.string().required().messages({
        'string.empty': `Confirmação de senha não pode ser vazia`,
        'any.required': `Confirmação de senha é obrigatória`
    }),
    plan_types: Joi.string().required().valid('Semestral', 'Anual').messages({
        'string.empty': `Tipo de plano não pode ser vazio`,
        'any.required': `Tipo de plano é obrigatório`,
        'any.only': `Tipo de plano inválido`
    }),
    card_type: Joi.string().required().valid('Mastercard', 'Visa', 'American Express', 'Hipercard').messages({
        'string.empty': `Tipo de cartão não pode ser vazio`,
        'any.required': `Tipo de cartão é obrigatório`,
        'any.only': `Tipo de cartão inválido`
    })
}).options({ abortEarly: false }).unknown();

const companyLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': `Email não pode ser vazio`,
        'any.required': `Email é obrigatório`,
        'string.email': `Email inválido`
    }),
    password: Joi.string().required().messages({
        'string.empty': `Senha não pode ser vazia`,
        'any.required': `Senha é obrigatória`
    })
}).options({ abortEarly: false }).unknown();

module.exports = {
    companyValidator,
    companyLoginSchema
};