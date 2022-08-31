const TransactionModel = require("./tx/tx.model");

let modelFactory = {
  TransactionModel: new TransactionModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
