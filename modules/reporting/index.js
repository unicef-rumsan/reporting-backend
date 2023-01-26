const Controller = require("./reporting.controller");
const Validator = require("./reporting.validator");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "reporting";
    options.listeners = {};
    options.controller = new Controller(options);
    options.validator = new Validator(options);
    super(options);
  }
  routes = {
    getBeneficiaryCountByGroup: {
      method: "GET",
      path: "/beneficiary/count-by-group",
      description: "Get Beneficiary count by group",
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

    /**
     * Real TIme Reports
     */

    groupClaimDistributionByWard: {
      method: "GET",
      path: "/beneficiary/claim-distribution-by-ward",
      description: "Get Benenneficiary claim count by ward",
    },
    groupWardByGender: {
      method: "GET",
      path: "/real-time/beneficiary/group-ward-gender",
    },

    getBeneficiaryCountByGender: {
      method: "GET",
      path: "/real-time/beneficiary/count-by-gender",
      description: "Get Beneficiary count by gender",
    },
    countGenderByWard: {
      method: "GET",
      path: "/real-time/beneficiary/count-gender-ward",
      description: "Get Beneficiary count by gender",
    },
    groupWardByClaim: {
      method: "GET",
      path: "/real-time/beneficiary/group-ward-claim",
      description: "Get Beneficiary count by claim",
    },
    groupWardByLandOwnership: {
      method: "GET",
      path: "/real-time/beneficiary/group-ward-land-ownership",
      description: "Get Beneficiary count by land ownership",
    },
    groupWardByDisability: {
      method: "GET",
      path: "/real-time/beneficiary/group-ward-disability",
      description: "Get Beneficiary count by disability",
    },
    groupWardByDailyWage: {
      method: "GET",
      path: "/real-time/beneficiary/group-ward-dailywage",
      description: "Get Beneficiary count by daily wage",
    },

    getBeneficiariesCounts: {
      method: "GET",
      path: "/real-time/beneficiary/counts",
      description: "Get Impacted Beneficiaries",
    },

    getWardClaimDistributionByKey: {
      method: "GET",
      path: "/beneficiary/ward-claim-distribution",
      description: "Get Impacted Beneficiaries",
    },

    /**
     * End of the day
     */

    getBeneficiaryGroupingData: {
      method: "GET",
      path: "/end-of-day/beneficiary/grouping-data",
      description: "Get Impacted Beneficiaries",
    },

    // #region Demographic
    getLandOwnerDemographicData: {
      method: "GET",
      path: "/demographic/ward",
      description: "Get Land Owner Demographic Data",
    },

    getDistributionSummary: {
      method: "GET",
      path: "/summary/distribution",
    },

    // #endregion
  };
};
