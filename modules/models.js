const TransactionClaimERCCacheModel = require("./cache_claimAcquiredERC20/cache.model");
const BeneficiaryModel = require("./beneficiary/beneficiary.model");
const VendorModel = require("./vendor/vendor.model");
const ProjectModel = require("./project/project.model");
const IssuedTokensModel = require("./issued-tokens/issued-tokens.model");

let modelFactory = {
  TransactionClaimERCCacheModel: new TransactionClaimERCCacheModel().init(),
  BeneficiaryModel: new BeneficiaryModel().init(),
  VendorModel: new VendorModel().init(),
  ProjectModel: new ProjectModel().init(),
  IssuedTokensModel: new IssuedTokensModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
