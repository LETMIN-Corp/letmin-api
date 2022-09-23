const Joi = require('joi');

const companyValidator = Joi.object({
	company: {
		name: Joi.string().required().messages({
			'string.empty': 'Nome da empresa não pode ser vazio',
			'any.required': 'Nome da empresa é obrigatório'
		}),
		cnpj: Joi.string().required().regex(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/).messages({
			'string.empty': 'CNPJ não pode ser vazio',
			'any.required': 'CNPJ é obrigatório',
			'string.pattern.base': 'CNPJ inválido'
		}),
		email: Joi.string().email().required().messages({
			'string.empty': 'Email não pode ser vazio',
			'any.required': 'Email é obrigatório',
			'string.email': 'Email inválido'
		}),
		// regex for (44) 44444-4444 or (44) 4444-4444 allowing spaces
		phone: Joi.string().required().regex(/^\([0-9]{2}\)\s[0-9]{4,5}-[0-9]{4}$/).messages({
			'string.empty': 'Telefone não pode ser vazio',
			'any.required': 'Telefone é obrigatório',
			'string.pattern.base': 'Telefone da empresa inválido'
		}),
		address: Joi.string().required().messages({
			'string.empty': 'Endereço não pode ser vazio',
			'any.required': 'Endereço é obrigatório'
		}),
	},
	holder: {
		name: Joi.string().required().messages({
			'string.empty': 'Nome do Titular não pode ser vazio',
			'any.required': 'Nome do Titular é obrigatório'
		}),
		cpf: Joi.string().required().regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/).messages({
			'string.empty': 'CPF do Titular não pode ser vazio',
			'any.required': 'CPF do Titular é obrigatório',
			'string.pattern.base': 'CPF do Titular inválido'
		}),
		email: Joi.string().email().required().messages({
			'string.empty': 'Email do Titular não pode ser vazio',
			'any.required': 'Email do Titular é obrigatório',
			'string.email': 'Email do Titular inválido'
		}),
		phone: Joi.string().required().regex(/^\([0-9]{2}\)\s[0-9]{4,5}-[0-9]{4}$/).messages({
			'string.empty': 'Telefone do Titular não pode ser vazio',
			'any.required': 'Telefone do Titular é obrigatório',
			'string.pattern.base': 'Telefone do Titular inválido'
		}),
		password: Joi.string().required().messages({
			'string.empty': 'Senha do Titular não pode ser vazia',
			'any.required': 'Senha do Titular é obrigatória'
		}),
		confirmPassword: Joi.string().required().messages({
			'string.empty': 'Confirmação de senha do Titular não pode ser vazia',
			'any.required': 'Confirmação de senha do Titular é obrigatória'
		}),
	},
	plan: {
		selected: Joi.string().required().valid('Semestral', 'Anual').messages({
			'string.empty': 'Tipo de plano não pode ser vazio',
			'any.required': 'Tipo de plano é obrigatório',
			'any.only': 'Tipo de plano inválido',
		}),
	},
	card: {
		type: Joi.string().required().valid('Mastercard', 'Visa', 'American Express', 'Hipercard').messages({
			'string.empty': 'Tipo de cartão não pode ser vazio',
			'any.required': 'Tipo de cartão é obrigatório',
			'any.only': 'Tipo de cartão inválido'
		}),
		number: Joi.string().required().messages({
			'string.empty': 'Número do cartão não pode ser vazio',
			'any.required': 'Número do cartão é obrigatório'
		}),
		code: Joi.string().required().messages({
			'string.empty': 'Código de segurança não pode ser vazio',
			'any.required': 'Código de segurança é obrigatório'
		}),
		expiration: Joi.string().required().messages({
			'string.empty': 'Data de vencimento não pode ser vazia',
			'any.required': 'Data de vencimento é obrigatória'
		}),
		owner: Joi.string().required().messages({
			'string.empty': 'Nome do Titular não pode ser vazio',
			'any.required': 'Nome do Titular é obrigatório'
		}),
	}
}).options({ abortEarly: false }).unknown();

const loginCompanySchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.empty': 'Email não pode ser vazio',
		'any.required': 'Email é obrigatório',
		'string.email': 'Email inválido'
	}),
	// cnpj: Joi.string().required().messages({
	//     'string.empty': `CNPJ não pode ser vazio`,
	//     'any.required': `CNPJ é obrigatório`,
	// }),
	password: Joi.string().required().messages({
		'string.empty': 'Senha não pode ser vazia',
		'any.required': 'Senha é obrigatória'
	})
}).options({ abortEarly: false }).unknown();

module.exports = {
	companyValidator,
	loginCompanySchema
};