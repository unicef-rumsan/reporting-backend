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
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.STRING,
    allowNull: false,
    set(v) {
      this.setDataValue("timestamp", v.toISOString());
      this.setDataValue("year", new Date(v).getFullYear());
    },
  },
  year: {
    type: Sequelize.STRING,
  },
  method: {
    type: Sequelize.ENUM("sms", "qr"),
    allowNull: false,
  },
  mode: {
    type: Sequelize.ENUM("online", "offline"),
    allowNull: false,
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblTxs" });
  }
};
