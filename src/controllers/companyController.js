const Company = require("../models/Company");
const bcrypt = require("bcryptjs");

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
        message: "Parabens! Você está logado.",
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
  
    let company = await Company.findOne({ 'company.cnpj' : credentials.company.cnpj });
    if (company) {
      return res.status(400).json({
        message: "CNPJ já foi cadastrado.",
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
      return res.header("Authorization", token).status(201).json({
        ...result,
        message: "Parabens! Você está cadastrado e logado.",
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

module.exports = {
    registerCompany,
    loginCompany,
}