const Validator = require("./cache.validators");
const Controller = require("./cache.controllers");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "claimAcquiredERC20Transactions";
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
    bulkAdd: {
      method: "POST",
      path: "/add/bulk",
      description: "Add new Transactions in bulk",
    },
    listByTxHashes: {
      method: "POST",
      path: "/listByTxHashes",
      description: "List all Transactions by txHashes",
    },
    update: {
      method: "PATCH",
      path: "/update/{txHash}",
      description: "Update Transaction",
    },
  };
};
