
const TransactionClaimERCCacheModel = require("./cache_claimAcquiredERC20/cache.model");
const BeneficiaryModel = require("./beneficiary/beneficiary.model");
const ProjectModel = require("./project/project.model");
const VendorModel = require("./vendor/vendor.model");

let modelFactory = {

  TransactionClaimERCCacheModel: new TransactionClaimERCCacheModel().init(),

  BeneficiaryModel: new BeneficiaryModel().init(),
  VendorModel: new VendorModel().init(),
  ProjectModel: new ProjectModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
