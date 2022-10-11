const Joi = require('joi');

const adminRegisterValidator = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Nome não pode ser vazio',
		'any.required': 'Nome é obrigatório'
	}),
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

const adminLoginValidator = Joi.object({
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

module.exports = {
	adminRegisterValidator,
	adminLoginValidator,
}