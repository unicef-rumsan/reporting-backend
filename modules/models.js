const BeneficiaryModel = require("./beneficiary/beneficiary.model");
const ProjectModel = require("./project/project.model");
const TransactionModel = require("./tx/tx.model");
const VendorModel = require("./vendor/vendor.model");

let modelFactory = {
  BeneficiaryModel: new BeneficiaryModel().init(),
  TransactionModel: new TransactionModel().init(),
  VendorModel: new VendorModel().init(),
  ProjectModel: new ProjectModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
