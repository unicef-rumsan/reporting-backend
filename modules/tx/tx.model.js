const Sequelize = require("sequelize");

const { AbstractModel } = require("@rumsan/core/abstract");

const schema = {
  txHash: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  blockNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  vendor: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblTxs" });
  }
};
