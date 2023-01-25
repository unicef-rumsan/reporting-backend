const Joi = require("joi");
const { AbstractValidator } = require("@rumsan/core/abstract");

const validators = {};

module.exports = class extends AbstractValidator {
  validators = validators;
};
