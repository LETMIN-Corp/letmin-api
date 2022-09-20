const Joi = require('joi');

const vacancyValidator = Joi.object({
	role: Joi.string().required().messages({
		'string.empty': 'Cargo não pode ser vazio',
		'any.required': 'Cargo é obrigatório'
	}),
	sector: Joi.string().required().valid('Recursos Humanos', 'Tecnologia', 'Administrativo', 'Financeiro', 'Operacional').messages({
		'string.empty': 'Setor não pode ser vazio',
		'any.required': 'Setor é obrigatório'
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Descrição não pode ser vazia',
		'any.required': 'Descrição é obrigatória'
	}),
	// number
	salary: Joi.string().required().messages({
		'string.empty': 'Salário não pode ser vazio',
		'any.required': 'Salário é obrigatório',
		//'number.base': `Salário deve ser um número`
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
	insertDate: Joi.date().required().messages({
		'string.empty': 'Data de inserção não pode ser vazia',
		'any.required': 'Data de inserção é obrigatória',
		'date.base': 'Data de inserção inválida',
		'typeError': 'Data de inserção deve ser uma data'
	}),
	expirationDate: Joi.date().required().messages({
		'string.empty': 'Data de fechamento não pode ser vazia',
		'any.required': 'Data de fechamento é obrigatória',
		'date.base': 'Data de fechamento inválida',
		'typeError': 'Data de fechamento deve ser uma data'
	}),
}).options({ abortEarly: false }).unknown();

module.exports = {
	vacancyValidator
};