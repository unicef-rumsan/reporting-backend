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
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  serviceInfo: {
    type: Sequelize.JSONB,
    // get() {
    //   return JSON.parse(this.getDataValue("serviceInfo"));
    // },
    set(v) {
      if (!(v.hasOwnProperty("sid") && v.hasOwnProperty("service")))
        throw new Error("Must send sid and service. ");
      return this.setDataValue("serviceInfo", JSON.stringify(v));
    },
  },
  beneficiaryId: Sequelize.STRING,
  from: Sequelize.STRING,
  hangupCause: Sequelize.STRING,
  billDuration: Sequelize.INTEGER,
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblCommunications" });
  }
};
