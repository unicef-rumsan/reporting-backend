const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: Sequelize.STRING,
  projectManager: Sequelize.STRING,
  location: Sequelize.STRING,
  // allocations: Sequelize.ARRAY(Sequelize.STRING),
  aidConnectActive: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
  financialInstitutions: Sequelize.ARRAY(Sequelize.JSON),
  balance: Sequelize.FLOAT,
  totalBudget: Sequelize.FLOAT,
  cashAllowance: Sequelize.FLOAT,
  cashBalance: Sequelize.FLOAT,
  tokenBalance: Sequelize.FLOAT,
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblProjects" });
  }
};
