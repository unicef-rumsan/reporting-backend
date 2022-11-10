const Joi = require("joi");
const { AbstracValidator } = require("@rumsan/core/abstract/validator");

const validators = {
  add: {
    payload: Joi.object({
      id: Joi.string().example("0x...."),
      name: Joi.string().example("Ram Nepali"),
      gender: Joi.string().allow("").optional(),
      phone: Joi.string().example("787878"),
      wallet_address: Joi.string().allow("").optional().example("0x00"),
      govt_id: Joi.string().example("0x...."),
      agencies: Joi.string().example({ name: "agen1" }),
    }),
  },

  bulkAdd: {
    payload: Joi.array().items({
      id: Joi.string().example("0x...."),
      name: Joi.string().example("Ram Nepali"),
      gender: Joi.string().allow("").optional(),
      phone: Joi.string().example("787878"),
      wallet_address: Joi.string().allow("").optional().example("0x00"),
      govt_id: Joi.string().example("0x...."),
      agencies: Joi.string().example({ name: "agen1" }),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().example("0x..."),
    }),
  },
};
