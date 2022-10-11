const Controller = require("./reporting.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "reporting";
    options.listeners = {};
    options.controller = new Controller(options);
    super(options);
  }
  routes = {
    getBeneficiaryCountByGroup: {
      method: "GET",
      path: "/beneficiary/count-by-group",
      description: "Get Beneficiary count by group",
    },
    getBeneficiaryCountByGender: {
      method: "GET",
      path: "/beneficiary/count-by-gender",
      description: "Get Beneficiary count by gender",
    },

    // transactions
    getTransactionsCountByMethod: {
      method: "GET",
      path: "/transactions/count-by-method",
      description: "Get Transactions count by method",
    },
    getTransactionsCountByMode: {
      method: "GET",
      path: "/transactions/count-by-mode",
      description: "Get Transactions count by mode",
    },
    getCountByWard: {
      method: "GET",
      path: "/transactions/count-by-ward",
      description: "Get Transactions count by ward",
    },
  };
};
