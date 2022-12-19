const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: Sequelize.STRING,
  gender: Sequelize.STRING,
  phone: Sequelize.STRING,
  walletAddress: Sequelize.STRING,
  govtId: Sequelize.STRING,
  agencies: Sequelize.ARRAY(Sequelize.JSON),
  projects: Sequelize.ARRAY(Sequelize.STRING),
  cashAllowance: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  tokenBalance: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  cashBalance: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  hasVendorRole: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblVendors" });
  }
};
