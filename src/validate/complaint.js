const Joi = require('joi');

const complaintValidator = Joi.object({
	reason: Joi.string().required().valid('Conteúdo Inapropriado', 'Spam', 'Outro').messages({
		'string.empty': 'Motivo não pode ser vazio',
		'any.required': 'Motivo é obrigatório',
		'any.only': 'Motivo inválido'
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Descrição não pode ser vazia',
		'any.required': 'Descrição é obrigatória'
	}),
	target: Joi.string().required().length(24).messages({
		'string.empty': 'Alvo não pode ser vazio',
		'any.required': 'Alvo é obrigatório',
		'string.length': 'Alvo inválido'
	})
}).options({ abortEarly: false }).unknown();

module.exports = complaintValidator;
