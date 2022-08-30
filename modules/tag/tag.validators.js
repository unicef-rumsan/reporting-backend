const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  add: {
    payload: Joi.object({
      title: Joi.string().required().error(new Error("Invalid title")),
    }),
  },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
