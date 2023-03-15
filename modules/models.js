const TransactionClaimERCCacheModel = require("./cache_claimAcquiredERC20/cache.model");
const BeneficiaryModel = require("./beneficiary/beneficiary.model");
const ProjectModel = require("./project/project.model");
const VendorModel = require("./vendor/vendor.model");
const IssuedTokensModel = require("./issued-tokens/issued-tokens.model");
const MiscModel = require("./misc/misc.model");
const CommunicationsModel = require("./communications/communications.model");
const JaleshworCommunicationModel = require("./communications/jaleshwor-communications.model");

let modelFactory = {
  TransactionClaimERCCacheModel: new TransactionClaimERCCacheModel().init(),

  BeneficiaryModel: new BeneficiaryModel().init(),
  VendorModel: new VendorModel().init(),
  ProjectModel: new ProjectModel().init(),
  IssuedTokensModel: new IssuedTokensModel().init(),
  MiscModel: new MiscModel().init(),
  CommunicationsModel: new CommunicationsModel().init(),
  JaleshworCommunicationModel: new JaleshworCommunicationModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
