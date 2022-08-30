const { db, DataTypes, Sequelize } = require("@rumsan/core").SequelizeDB;

const { AbstractModel } = require("@rumsan/core/abstract");

const schema = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  title: {
    type: Sequelize.STRING,
    unique: true,
  },
};
module.exports = class TagModel extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblTags" });
  }
};
