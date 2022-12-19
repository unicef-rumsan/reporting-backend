const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  claimedAmount: Sequelize.INTEGER,
  date: Sequelize.DATE,
  issuerPhone: Sequelize.STRING,
  txHash: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  // total token Issued, claimed (claimed>= issued = isClaimed true) isIssued = boolean
  // claimedAmount, issuedAmount, date, issuerPhone, txHash(opt) -- issued table
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblIssuedTokens" });
  }
};
