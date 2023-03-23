const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  type: {
    type: Sequelize.ENUM,
    allowNull: false,
    values: ["sms", "call"],
  },
  status: {
    type: Sequelize.ENUM,
    allowNull: false,
    values: ["success", "unanswered", "busy", "fail"],
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  timestamp: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  ward: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  hasBank: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  to: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  from: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  beneficiaryId: {
    type: Sequelize.STRING,
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblJswCommunications" });
  }
};
