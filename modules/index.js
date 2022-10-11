require("./services");
const WSService = require("@rumsan/core/services/webSocket");
const { AppSettings } = require("@rumsan/core");
const _Transactions = require("./tx");
const ContractListener = require("./_listeners/contractListeners");
const _Beneficiaries = require("./beneficiary");
const _Vendors = require("./vendor");
const _Projects = require("./project");
const _Reporting = require("./reporting");
//const Tag = require("./tag");
const { mailOtp } = require("./eventHandlers");
const { EVENTS } = require("../constants/appConstants");

let Routes = {
  AppSettings: AppSettings.Router(),
  Transactions: new _Transactions(),
  Beneficiaries: new _Beneficiaries(),
  Vendors: new _Vendors(),
  Projects: new _Projects(),
  Reporting: new _Reporting(),
};

ContractListener.on(EVENTS.TRANSACTION_ADDED, (data) => {
  Routes.Transactions._controllers.add(data);
});

ContractListener.getLogsFromExplorer().then(async (data) => {
  await Routes.Transactions._controllers._bulkAdd(data);
});

module.exports = Routes;
