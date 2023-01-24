const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  updateUsingPhone: {
    params: Joi.object({
      phone: Joi.string().required().example("+977158675309"),
    }),
    payload: Joi.object({
      beneficiaryId: Joi.string().required().example("1"),
    }),
  },
  addCallbackUrl: {
    payload: Joi.object({
      CallSid: Joi.string().required().example("CA1234567890ABCDE"),
      From: Joi.string().required().example("+977158675309"),
      To: Joi.string().required().example("+977158675309"),
      CallStatus: Joi.string().example("completed"),
      CallDuration: Joi.string().required().example(2),
      Timestamp: Joi.string().required().example("2020-10-10T10:10:10Z"),
    }),
  },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
