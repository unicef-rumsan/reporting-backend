// const Validator = require("./issued-tokens.validators");
const Controller = require("./issued-tokens.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "issued-tokens";
    options.listeners = {};
    options.controller = new Controller(options);
    // options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new Beneficiary",
    },
  };
};
