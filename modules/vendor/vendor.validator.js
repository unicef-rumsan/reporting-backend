const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  getByWard: {
    params: Joi.object({
      ward: Joi.string().required(),
    }),
  },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
