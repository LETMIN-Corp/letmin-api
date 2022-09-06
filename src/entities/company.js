const Company = require("../models/Company");


const { companyValidator, loginCompanySchema } = require("../validate/company");


const {
  generateToken,
  verifyGoogleToken,
  verifyToken,
  decodeToken
} = require("../utils/jwt");

/**
 * @ACCESS Public
 */

/**
 * @DESC Passport middleware
 */


/**
 * @DESC Check Role Middleware
 */

 const getCompanyData = async (req, res) => {
    let credentials = req.body;
  
    await Company.findOne({ 'company.cnpj' : credentials.company.cnpj })
    .then(company => {

      let result = {
        company: {
            name: company.name,
            cnpj: company.cnpj,
            email: company.email,
            phone: company.phone,
            address: company.address,
        },
        holder: {
            name: company.holder.name,
            cpf: company.holder.cpf,
            email: company.holder.email,
            phone: company.holder.phone,
        },
        plan: {
            selected: company.plan.selected,
        },
        card: {
            type: company.card.type,
            number: company.card.number,
            code: company.card.code,
            expiration: company.card.expiration,
            owner: company.card.owner,
        },
      };

      console.log(result)

    }).catch(err => {
      return res.status(500).json({
        message: "Não foi possivel encontrar a empresa",
        error: err,
        success: false
      });
    });
  }

module.exports = {
    getCompanyData,
};
