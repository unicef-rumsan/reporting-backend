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
  totalBudget: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
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
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblProjects" });
  }
};
