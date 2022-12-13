// const Validator = require("./vendor.validators");
const Controller = require("./vendor.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "vendors";
    options.listeners = {};
    options.controller = new Controller(options);
    // options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new vendor",
    },
    bulkAdd: {
      method: "POST",
      path: "/bulk",
      description: "Add new vendor in bulk",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all vendor",
      //permissions: ["note_read"],
    },
    getById: {
      method: "GET",
      path: "/{id}",
      description: "Get vendor by id",
    },
    updateTokenInfo: {
      method: "PATCH",
      path: "/updateTokenInfo/{vendorId}",
      description: "Update token info",
    },
  };
};
