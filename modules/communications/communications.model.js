const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  api_version: {
    type: Sequelize.STRING,
  },
  sid: {
    type: Sequelize.STRING,
  },
  account_sid: {
    type: Sequelize.STRING,
  },
  date_created: {
    type: Sequelize.STRING,
  },
  date_updated: {
    type: Sequelize.STRING,
  },
  annotation: {
    type: Sequelize.STRING,
  },
  from: {
    type: Sequelize.STRING,
    set(v) {
      this.setDataValue("from", v.replace("+977", ""));
    },
  },
  to: {
    type: Sequelize.STRING,
    set(v) {
      this.setDataValue("to", v.replace("+977", ""));
    },
  },
  uri: {
    type: Sequelize.STRING,
  },
  duration: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.STRING,
  },
  price_unit: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  direction: {
    type: Sequelize.STRING,
  },
  error_code: {
    type: Sequelize.STRING,
  },
  error_message: {
    type: Sequelize.STRING,
  },
  body: {
    type: Sequelize.STRING,
  },
  num_segments: {
    type: Sequelize.STRING,
  },
  num_media: {
    type: Sequelize.STRING,
  },
  date_sent: {
    type: Sequelize.STRING,
  },
  communication_type: {
    type: Sequelize.ENUM,
    values: ["sms", "call"],
  },
  isBeneficiary: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  beneficiaryId: {
    type: Sequelize.STRING,
    set(v) {
      this.setDataValue("beneficiaryId", v);
      this.setDataValue("isBeneficiary", true);
    },
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblCommunications" });
  }
};
