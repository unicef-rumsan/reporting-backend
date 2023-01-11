const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  to: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
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
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  beneficiaryId: Sequelize.STRING,
  from: Sequelize.STRING,
  hangupCause: Sequelize.STRING,
  duration: Sequelize.INTEGER,
  billDuration: Sequelize.INTEGER,
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblCommunications" });
  }
};
