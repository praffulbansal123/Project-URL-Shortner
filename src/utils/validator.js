const Joi = require("joi");

const isValid = function (object) {
    return Object.keys(object).length === 1;
  };
  
const urlschema = Joi.object({
    urlCode: Joi.string().required().lowercase().trim(),
    longUrl: Joi.string().uri().lowercase().required(),
    shortUrl: Joi.string().required()  
  })

module.exports =  { isValid, urlschema }