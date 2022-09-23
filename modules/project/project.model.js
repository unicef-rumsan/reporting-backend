const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: Sequelize.STRING,
  project_manager: Sequelize.STRING,
  location: Sequelize.STRING,
  allocations: Sequelize.ARRAY(Sequelize.STRING),
  financial_institutions: Sequelize.ARRAY(Sequelize.JSON),
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblProjects" });
  }
};
