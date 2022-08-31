const Transaction = require("./tx/tx.controllers");

const controllers = {
  TransactionController: new Transaction(),
};

module.exports = controllers;
