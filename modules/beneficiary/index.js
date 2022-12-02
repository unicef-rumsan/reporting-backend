const Validator = require("./beneficiary.validators");
const Controller = require("./beneficiary.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "beneficiaries";
    options.listeners = {};
    options.controller = new Controller(options);
    options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new Beneficiary",
    },
    bulkAdd: {
      method: "POST",
      path: "/bulk",
      description: "Add new Beneficiary in bulk",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all Beneficiary",
      //permissions: ["note_read"],
    },
    getById: {
      method: "GET",
      path: "/{id}",
      description: "Get Beneficiary by id",
    },
    updateExplorerTokenInfo: {
      method: "PATCH",
      path: "/updateExplorerTokenInfo/{beneficiaryPhone}",
      description: "Update Beneficiary Explorer Token Info",
    },
  };
};
