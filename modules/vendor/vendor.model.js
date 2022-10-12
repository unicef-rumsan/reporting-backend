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
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblVendors" });
  }
};
