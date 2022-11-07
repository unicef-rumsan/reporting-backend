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
  age: Sequelize.INTEGER,
  child: Sequelize.INTEGER,
  numOfAdults: Sequelize.INTEGER,
  numOfChildren: Sequelize.INTEGER,
  group: Sequelize.STRING,
  walletAddress: Sequelize.STRING,
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblBeneficiaries" });
  }
};
