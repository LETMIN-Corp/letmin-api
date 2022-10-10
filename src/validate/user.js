const Joi = require('joi');

const userValidator = Joi.object({
	username: Joi.string().required().messages({
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
	}),
	picture: Joi.string().messages({
		'string.empty': 'Foto não pode ser vazia',
		'typeError': 'Foto deve ser uma string'
	}),
}).options({ abortEarly: false }).unknown();

const userUpdateValidator = Joi.object({
	username: Joi.string().required().messages({
		'string.empty': 'Nome não pode ser vazio',
		'any.required': 'Nome é obrigatório'
	}),
	email: Joi.string().email().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
		'string.email': 'Email inválido'
	}),
	picture: Joi.string().messages({
		'string.empty': 'Foto não pode ser vazia',
		'typeError': 'Foto deve ser uma string'
	}),
}).options({ abortEarly: false }).unknown();

const updateUserFormations = Joi.array().items({
	name: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	institution: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	start: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	finish: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	})
})


//.options({ abortEarly: false }).unknown();

const updateUserExperiences = Joi.array().items({
	role: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	company: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	start: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	finish: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
	})
})
//.options({ abortEarly: false }).unknown();

module.exports = {
	userValidator,
	userUpdateValidator,
	updateUserFormations,
	updateUserExperiences,
};