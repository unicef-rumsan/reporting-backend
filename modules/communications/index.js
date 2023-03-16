const Validator = require("./communications.validators");
const Controller = require("./communications.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "communications";
    options.listeners = {};
    options.controller = new Controller(options);
    options.validator = new Validator(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "",
      description: "Add new communications",
    },
    bulkAdd: {
      method: "POST",
      path: "/bulk",
      description: "Add new communications in bulk",
    },
    list: {
      method: "GET",
      path: "",
      description: "List all communications",
      //permissions: ["note_read"],
    },
    getById: {
      method: "GET",
      path: "/{id}",
      description: "Get communications by id",
    },
    update: {
      method: "PUT",
      path: "/{id}",
      description: "Update communications by id",
    },
    getCommunicationByBeneficiaryId: {
      method: "GET",
      path: "/beneficiary/{id}",
      description: "Get communications by beneficiary id",
    },
    addCallbackUrl: {
      method: "POST",
      path: "/callback",
      description: "Add call webhook",
    },
    getJswCommList: {
      method: "GET",
      path: "/jaleshwor",
      description: "Get jaleshwor communications list",
    },
    addJlsComm: {
      method: "POST",
      path: "/jaleshwor",
      description: "Add jaleshwor communications",
    },
    getJswCommByPhone: {
      method: "GET",
      path: "/jaleshwor/{phone}",
      description: "Get jaleshwor communications by phone",
    },
  };
};
