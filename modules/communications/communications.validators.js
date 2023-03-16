const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  getJswCommList: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(10),
      start: Joi.number().integer().min(0).default(0),
      ward: Joi.string().example("2"),
      status: Joi.string().example("success"),
      hasBank: Joi.boolean().example(false),
      type: Joi.string().example("sms"),
      to: Joi.string().example("9840000000"),
    }),
  },

  getJswCommByPhone: {
    params: Joi.object({
      phone: Joi.string().example("9840000000"),
    }),
  },

  addCallbackUrl: {
    payload: Joi.object({
      CallSid: Joi.string().example("9865-4565"),
      From: Joi.string().example("+9779814859745"),
      To: Joi.string().example("+9779814859745"),
      CallStatus: Joi.string().example("success"),
      CallDuration: Joi.string().example(2),
      Timestamp: Joi.string().example("1678850837"),
      type: Joi.string().example("call"),
    }),
  },
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
