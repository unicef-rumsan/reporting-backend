// const Validator = require("./beneficiary.validators");
const Controller = require("./project.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "projects";
    options.listeners = {};
    options.controller = new Controller(options);
    // options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new Project",
    },
    bulkAdd: {
      method: "POST",
      path: "/bulk",
      description: "Add new Project in bulk",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all Project",
      //permissions: ["note_read"],
    },
    getById: {
      method: "GET",
      path: "/{id}",
      description: "Get Project by id",
    },
    updateTokenInfo: {
      method: "PATCH",
      path: "/updateTokenInfo/{projectId}",
      description: "Update token info",
    },
  };
};
