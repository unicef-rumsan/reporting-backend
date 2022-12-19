const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {
  groupWardByGender: {
    query: Joi.object({
      ward: Joi.string().required(),
    }),
  },
  groupWardByClaim: {
    query: Joi.object({
      ward: Joi.string().required(),
    }),
  },
  groupWardByLandOwnership: {
    query: Joi.object({
      ward: Joi.string().required(),
    }),
  },
  groupWardByDisability: {
    query: Joi.object({
      ward: Joi.string().required(),
    }),
  },

  //#region Demographic Reports

  getLandOwnerDemographicData: {
    query: Joi.object({
      ward: Joi.string(),
      filterKey: Joi.string().required(),
    }),
  },
  // #endregion
};

module.exports = class extends AbstractValidator {
  validators = validators;
};
