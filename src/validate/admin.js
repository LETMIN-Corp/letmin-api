const Joi = require('joi');

const adminSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
		'string.email': 'Email inválido'
	}),
	password: Joi.string().required().messages({
		'string.empty': 'Senha não pode ser vazia',
		'any.required': 'Senha é obrigatória'
	})
}).options({ abortEarly: false }).unknown();

module.exports = adminSchema;