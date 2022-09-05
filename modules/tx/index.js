const Validator = require("./tx.validators");
const Controller = require("./tx.controllers");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "transactions";
    options.listeners = {};
    options.controller = new Controller(options);
    options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new Transaction",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all Transactions",
      //permissions: ["note_read"],
    },
  };
};
