const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  add: {
    payload: Joi.object({}),
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
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
