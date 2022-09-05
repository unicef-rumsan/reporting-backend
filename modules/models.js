const TransactionModel = require("./tx/tx.model");
const BeneficiaryModel = require("./beneficiary/beneficiary.model");

let modelFactory = {
  TransactionModel: new TransactionModel().init(),
  BeneficiaryModel: new BeneficiaryModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
