const { UserModel } = require("@rumsan/user");
const { DataTypes } = require("sequelize");

module.exports = class extends UserModel {
  constructor() {
    super();
    this.addSchema({
      home_address: {
        type: DataTypes.STRING,
      },
    });
  }
};
