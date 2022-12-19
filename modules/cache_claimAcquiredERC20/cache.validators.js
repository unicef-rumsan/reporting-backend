const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  add: {
    payload: Joi.object({}),
  },
  // update: {
  //   // payload: Joi.object({}),
  //   params: Joi.object({
  //     txHash: Joi.string().required(),
  //   }),
  // },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
