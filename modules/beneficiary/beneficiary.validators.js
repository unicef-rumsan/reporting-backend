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
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
