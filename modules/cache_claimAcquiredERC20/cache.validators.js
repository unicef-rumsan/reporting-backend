const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  add: {
    payload: Joi.object({
      id: Joi.string().example("0x..."),
      txHash: Joi.string().example("0x.."),
      blockNumber: Joi.string().example("0x..."),
      vendor: Joi.string().example("test"),
      amount: Joi.number()
        .integer()
        .min(0)
        .max(1000)
        .allow("")
        .optional()
        .example("999"),
      phone: Joi.string().example("9863662"),
      ward: Joi.number()
        .integer()
        .min(0)
        .max(10)
        .allow("")
        .optional()
        .example("2"),
      timeStamp: Joi.string().example("2018-02-27 15:35:20.311"),
      year: Joi.string().example("2022"),
      method: Joi.string().valid("sms", "qr"),
      mode: Joi.string().valid("online", "offline"),
    }),
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
