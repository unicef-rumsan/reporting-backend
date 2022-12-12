const { AbstractModel } = require("@rumsan/core/abstract");
const { DataTypes } = require("sequelize");

const schema = {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.JSONB,
    get() {
      return JSON.parse(this.getDataValue("value"));
    },
    set(v) {
      return this.setDataValue("value", JSON.stringify(v));
    },
    allowNull: false,
  },
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblMisc" });
  }
};
