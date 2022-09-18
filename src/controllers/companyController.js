const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const ObjectId = require('mongoose').Types.ObjectId;

const ROLES = require('../utils/constants');

const {
    generateToken,
    verifyToken,
    decodeToken
} = require("../utils/jwt");

const loginCompany = async (req, res) => {
  const credentials = req.body;
  
  Company.findOne({ 'company.email' : credentials.email })
  .then(async (company) => {

    if (company.status.blocked) {
      return res.status(401).json({
        message: "Empresa bloqueada, entre em contato com o adminsitrador.",
        success: false
      });
    }

    let isMatch = await bcrypt.compare(credentials.password, company.holder.password);

    if(!isMatch){
        return res.status(400).json({
            message: 'Credenciais incorretas',
            success: false
        });
    }
      let token = generateToken(company, ROLES.COMPANY);
  
      let result = {
        company: {
          name: company.name,
          email: company.email,
        },
        holder: {
          name: company.name,
          email: company.email,
          phone: company.phone,
        },
        token: token,
      };
      return res.header("Authorization", token).status(200).json({
        ...result,
        message: "Parabéns! Você está logado.",
        success: true
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: 'Error ' + err,
        success: false
      });
    })
}

const registerCompany = async (req, res, next) => {
    let credentials = req.body;
  
    let company = await Company.findOne({
      'company.cnpj' : credentials.company.cnpj,
      'company.email' : credentials.company.email 
    }).select('+company.cnpj +company.email');

    if (company) {
      return res.status(400).json({
        message: "CNPJ ou email já foi cadastrado.",
        success: false
      });
    }
  
    credentials.holder.password = await bcrypt.hash(credentials.holder.password, 12);
  
    company = new Company({
      ...credentials,
      role: ROLES.COMPANY,
    });
  
    company.save()
    .then(company => {
  
      let token = generateToken(company, ROLES.COMPANY);
      let result = {
        company: {
          name: company.company.name,
          email: company.company.email,
        },
        holder: {
          name: company.holder.name,
          email: company.holder.email,
          phone: company.holder.phone,
        },
        token: token,
      };
      return res.header("Authorization", token).status(201).json({
        ...result,
        message: "Parabéns! Você está cadastrado e logado.",
        success: true
      });
    }).catch(err => {
      return res.status(500).json({
        message: "Não foi possivel cadastrar a empresa.",
        error: err,
        success: false
      });
    });
}

const getCompanyData = async (req, res) => {
    let token = req.headers.authorization;

    let _id = ObjectId(decodeToken(token).user_id);
    console.log(_id);
    await Company.findById({ _id }).select('-holder.password -_id')
    .then((company) => {
      
      return res.status(200).json({
        data: company,
        message: "Dados da empresa.",
        success: true
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: 'Error ' + err,
        success: false
      });
    })
}

module.exports = {
    registerCompany,
    loginCompany,
    getCompanyData
}