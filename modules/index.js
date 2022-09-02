require("./services");
const WSService = require("@rumsan/core/services/webSocket");
const { AppSettings } = require("@rumsan/core");
const _Transactions = require("./tx");
const ContractListener = require("./_listeners/contractListeners");
const _Beneficiaries = require("./beneficiary");

//const Tag = require("./tag");
const { mailOtp } = require("./eventHandlers");
const { EVENTS } = require("../constants/appConstants");

let Routes = {
  AppSettings: AppSettings.Router(),
  Transactions: new _Transactions(),
  Beneficiaries: new _Beneficiaries(),
};

ContractListener.on(EVENTS.TRANSACTION_ADDED, (data) => {
  Routes.Transactions._controllers.add(data);
});

module.exports = Routes;
