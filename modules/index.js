require("./services");
const { AppSettings } = require("@rumsan/core");
const TransactionsCacheClaimAcquiredERC20 = require("./cache_claimAcquiredERC20");
const ContractListener = require("./_listeners/contractListeners");
const _Beneficiaries = require("./beneficiary");
const _Vendors = require("./vendor");
const _Projects = require("./project");
const _Reporting = require("./reporting");
const _IssuedTokens = require("./issued-tokens");
const Misc = require("./misc");
//const Tag = require("./tag");
const { mailOtp } = require("./eventHandlers");
const { EVENTS } = require("../constants/appConstants");
const _Communications = require("./communications");

let Routes = {
  AppSettings: AppSettings.Router(),
  TransactionsCacheClaimAcquiredERC20:
    new TransactionsCacheClaimAcquiredERC20(),
  Beneficiaries: new _Beneficiaries(),
  Vendors: new _Vendors(),
  Projects: new _Projects(),
  Reporting: new _Reporting(),
  IssuedTokens: new _IssuedTokens(),
  Misc: new Misc(),
  Communications: new _Communications(),
};

ContractListener.on(EVENTS.TRANSACTION_ADDED, (data) => {
  Routes.TransactionsCacheClaimAcquiredERC20._controllers.add(data);
});

// ContractListener.on(EVENTS.TRANSACTION_ADDED_EXPLORER_BULK, (data) => {
//   Routes.Transactions._controllers._bulkAdd(data);
// });

module.exports = Routes;
