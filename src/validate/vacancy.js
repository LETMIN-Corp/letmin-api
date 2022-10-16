const Joi = require('joi');

const vacancyValidator = Joi.object({
	role: Joi.string().required().messages({
		'string.empty': 'Cargo não pode ser vazio',
		'any.required': 'Cargo é obrigatório'
	}),
	sector: Joi.string().required().valid('Recursos Humanos', 'Tecnologia', 'Administrativo', 'Financeiro', 'Operacional', 'Comércio', 'Serviços', 'Saúde', 'Industrial', 'Construção').messages({
		'string.empty': 'Setor não pode ser vazio',
		'any.required': 'Setor é obrigatório',
		'any.only': 'Setor inválido'
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Descrição não pode ser vazia',
		'any.required': 'Descrição é obrigatória'
	}),
	salary: Joi.string().required().messages({
		'string.empty': 'Salário não pode ser vazio',
		'any.required': 'Salário é obrigatório',
	}),
	currency: Joi.string().required().valid('Real', 'Dolar', 'Euro').messages({
		'string.empty': 'Moeda não pode ser vazia',
		'any.required': 'Moeda é obrigatória',
		'any.only': 'Moeda inválida'
	}),
	workload: Joi.string().required().valid('Integral', 'Meio Período', 'Home Office').messages({
		'string.empty': 'Carga horária não pode ser vazia',
		'any.required': 'Carga horária é obrigatória',
		'any.only': 'Carga horária inválida'
	}),
	region: Joi.string().required().valid('Sul', 'Sudeste', 'Centro-Oeste', 'Norte', 'Nordeste').messages({
		'string.empty': 'Região não pode ser vazia',
		'any.required': 'Região é obrigatória',
		'any.only': 'Região inválida'
	}),
	type: Joi.string().required().valid('Estágio', 'Permanente', 'Temporário').messages({
		'string.empty': 'Tipo de contratação não pode ser vazio',
		'any.required': 'Tipo de contratação é obrigatório',
		'any.only': 'Tipo de contratação inválida'
	}),
	wantedSkills: Joi.array().items({
		name: Joi.string().allow("").min(2).max(45).messages({
			'string.min': 'O nome da habilidade deve ser maior que 2 caractéres',
		}),
		level: Joi.string().allow("").valid('Iniciante', 'Intermediário', 'Avançado').messages({
			'string.only': 'Tipo de nível inválido'
		})
	}),
	yearsOfExperience: Joi.number().integer().min(0).max(40).messages({
		'number.base': 'Anos de experiência deve ser um número',
		'number.integer': 'Anos de experiência deve ser um número inteiro',
		'number.min': 'Anos de experiência deve ser maior ou igual a 0',
		'number.max': 'Anos de experiência não podem ser absurdos',
		'typeError': 'O valor deve ser um inteiro'
	})	
}).options({ abortEarly: false }).unknown();

module.exports = {
	vacancyValidator
};