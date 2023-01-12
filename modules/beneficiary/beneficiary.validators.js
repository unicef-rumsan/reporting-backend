const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  add: {
    payload: Joi.object({
      id: Joi.string().example("0x...."),
      name: Joi.string().example("Ram Nepali"),
      gender: Joi.string().allow("").optional(),
      phone: Joi.string().example("787878"),
      age: Joi.number()
        .integer()
        .min(0)
        .max(150)
        .allow("")
        .optional()
        .example("5"),
      child: Joi.number()
        .integer()
        .min(0)
        .max(50)
        .allow("")
        .optional()
        .example("5"),
      group: Joi.string().allow("").optional().example("G"),
      wallet_address: Joi.string().allow("").optional().example("0x00"),
    }),
  },
  updateExplorerTokenInfo: {
    // params: Joi.object({
    //   beneficiaryPhone: Joi.string().required(),
    // }),
    // payload: Joi.object({
    //   isClaimed: Joi.boolean().required(),
    //   isOffline: Joi.boolean().required(),
    //   tokenIssued: Joi.number().required(),
    // }),
  },
  getBeneficiaryByWard: {
    query: Joi.object({
      ward: Joi.string().required(),
    }),
  },
  list: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).default(50),
      ward: Joi.string().allow("").optional(),
      hasBank: Joi.string().allow("").optional(),
      start: Joi.number().integer().min(0).default(0),
      isClaimed: Joi.string().allow("").optional(),
      phone: Joi.string().allow("").optional(),
      name: Joi.string().allow("").optional(),
    }),
  },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
