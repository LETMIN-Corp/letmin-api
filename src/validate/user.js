const Joi = require('joi');

const userValidator = Joi.object({
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
	}),
	picture: Joi.string().messages({
		'string.empty': 'Foto não pode ser vazia',
		'typeError': 'Foto deve ser uma string'
	}),
}).options({ abortEarly: false }).unknown();

const userUpdateValidator = Joi.object({
	name: Joi.string().min(6).max(64).required().messages({
		'string.empty': 'Nome não pode ser vazio',
		'any.required': 'Nome é obrigatório',
		'string.min': 'Nome deve ter no mínimo 6 caracteres',
		'string.max': 'Nome deve ter no máximo 64 caracteres'
	}),
	email: Joi.string().email().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
		'string.email': 'Email inválido'
	}),
	role: Joi.string().allow('').messages({
		'string.empty': 'Cargo não pode ser vazia',
		'typeError': 'Cargo deve ser uma string'
	}),
	description: Joi.string().allow('').messages({
		'string.empty': 'Descrição não pode ser vazia',
		'typeError': 'Descrição deve ser uma string'
	}),
	picture: Joi.string().messages({
		'string.empty': 'Foto não pode ser vazia',
		'typeError': 'Foto deve ser uma string'
	}),
}).options({ abortEarly: false }).unknown();

const checkUserFormations = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Formação não pode ser vazio',
		'any.required': 'Formação é obrigatório',
	}),
	institution: Joi.string().required().messages({
		'string.empty': 'Instituição não pode ser vazio',
		'any.required': 'Instituição é obrigatório',
	}),
	start: Joi.number().required().min(1900).max(new Date().getFullYear() + 1).messages({
		'number.base': 'Ano de Início deve ser um número',
		'number.empty': 'Ano de Início não pode ser vazio',
		'any.required': 'Ano de Início é obrigatório',
		'number.min': 'O ano de Início deve ser maior que 1900',
		'number.max': 'O ano de Início deve ser menor ou igual ao ano atual',
	}),
	finish: Joi.number().required().min(1900).max(new Date().getFullYear() + 1).messages({
		'number.base': 'Ano de Término deve ser um número',
		'number.empty': 'Ano de Término não pode ser vazio',
		'any.required': 'Ano de Término é obrigatório',
		'number.min': 'O ano de Término deve ser maior que 1900',
		'number.max': 'O ano de Término deve ser menor ou igual ao ano atual',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Descrição não pode ser vazio',
		'any.required': 'Descrição é obrigatório',
	})
}).options({ abortEarly: false }).unknown();

const checkUserExperiences = Joi.object({
	role: Joi.string().required().messages({
		'string.empty': 'Nome não pode ser vazio',
		'any.required': 'Nome é obrigatório',
	}),
	company: Joi.string().required().messages({
		'string.empty': 'Empresa não pode ser vazio',
		'any.required': 'Empresa é obrigatório',
	}),
	start: Joi.number().required().min(1900).max(new Date().getFullYear() + 1).messages({
		'number.base': 'Ano de Início deve ser um número',
		'number.empty': 'Ano de Início não pode ser vazio',
		'any.required': 'Ano de Início é obrigatório',
		'number.min': 'O ano de Início deve ser maior que 1900',
		'number.max': 'O ano de Início deve ser menor ou igual ao ano atual',
	}),
	finish: Joi.number().required().min(1900).max(new Date().getFullYear() + 1).messages({
		'number.base': 'Ano de Término deve ser um número',
		'number.empty': 'Ano de Término não pode ser vazio',
		'any.required': 'Ano de Término é obrigatório',
		'number.min': 'O ano de Término deve ser maior que 1900',
		'number.max': 'O ano de Término deve ser menor ou igual ao ano atual',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Descrição não pode ser vazio',
		'any.required': 'Descrição é obrigatório',
	})
}).options({ abortEarly: false }).unknown();

const checkUserSkills = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Nome não pode ser vazio',
		'any.required': 'Nome é obrigatório',
	}),
	level: Joi.string().required().messages({
		'string.empty': 'Nivel de habilidade é obrigatório',
		'any.required': 'Nivel de habilidade é obrigatório',
	})
}).options({ abortEarly: false }).unknown();

module.exports = {
	userValidator,
	userUpdateValidator,
	checkUserFormations,
	checkUserExperiences,
	checkUserSkills,
};