const Transaction = require("./tx/tx.controllers");
const Beneficiary = require("./beneficiary/beneficiary.controller");
const Vendor = require("./vendor/vendor.controller");

const controllers = {
  TransactionController: new Transaction(),
  BeneficiaryController: new Beneficiary(),
  VendorController: new Vendor(),
};

module.exports = controllers;
