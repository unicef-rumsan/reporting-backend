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
  ward: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  timestamp: {
    type: "TIMESTAMP",
    set(v) {
      // this.setDataValue("timestamp", v.toISOString());
      this.setDataValue("year", new Date(v).getFullYear());
    },
  },
  year: {
    type: Sequelize.STRING,
  },
  method: {
    type: Sequelize.ENUM("sms", "qr", "unavailable"),
    defaultValue: "unavailable",
  },
  mode: {
    type: Sequelize.ENUM("online", "offline", "unavailable"),
    defaultValue: "unavailable",
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblCache_ClaimAcquiredERC20" });
  }
};
