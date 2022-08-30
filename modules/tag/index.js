const Validator = require("./tag.validators");
const Controller = require("./tag.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");
const { db } = require("@rumsan/core").SequelizeDB;
module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "tags";
    options.controller = new Controller(options);
    options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new Tag",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all Tags",
      //permissions: ["note_read"],
    },
  };
};
