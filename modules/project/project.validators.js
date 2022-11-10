const Joi = require("joi");
const { AbstracValidator } = require("@rumsan/core/abstract/validator");

const validators = {
  add: {
    payload: Joi.object({
      id: Joi.string().example("0x...."),
      name: Joi.string().example("Ram Nepali"),
      project_manager: Joi.string().example("test"),
      location: Joi.string().example("Bhaktapur"),
      allocations: Joi.string().example(["test"]),
      financial_institutions: Joi.string().example({ name: "here" }),
    }),
  },

  bulkAdd: {
    payload: Joi.array().items({
      id: Joi.string().example("0x..."),
      name: Joi.string().example("irusha"),
      project_manager: Joi.string().example("test"),
      location: Joi.string().example("Bhaktapur"),
      allocations: Joi.string().example(["test"]),
      financial_institutions: Joi.string().example({ name: "here" }),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().example("0x..."),
    }),
  },
};
