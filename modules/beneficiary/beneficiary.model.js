const { AbstractModel } = require("@rumsan/core/abstract");
const Sequelize = require("sequelize");

const schema = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  projects: Sequelize.ARRAY(Sequelize.STRING),
  agency: Sequelize.STRING,
  name: Sequelize.STRING,
  gender: Sequelize.STRING,
  phone: {
    type: Sequelize.STRING,
    set(v) {
      let isPhoneFake = v.startsWith("999");
      this.setDataValue("isQR", isPhoneFake);
      this.setDataValue("phone", v);
    },
  },
  age: Sequelize.INTEGER,
  child: Sequelize.INTEGER,
  numOfAdults: Sequelize.INTEGER,
  numOfChildren: Sequelize.INTEGER,
  group: Sequelize.STRING,
  walletAddress: Sequelize.STRING,
  familySize: Sequelize.INTEGER,
  below5Count: Sequelize.INTEGER,
  below5Male: Sequelize.INTEGER,
  below5Female: Sequelize.INTEGER,
  below5_other: Sequelize.INTEGER,
  readSms: Sequelize.BOOLEAN,
  hasPhone: Sequelize.BOOLEAN,
  hasBank: Sequelize.BOOLEAN,
  noLand: Sequelize.BOOLEAN,
  bank_withdraw: Sequelize.BOOLEAN,
  dailyWage: Sequelize.BOOLEAN,
  disability: Sequelize.BOOLEAN,
  consentPicture: Sequelize.BOOLEAN,
  bankAccountNumber: Sequelize.STRING,
  mobilizer: Sequelize.STRING,
  ward: Sequelize.STRING,
  isClaimed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isOffline: Sequelize.BOOLEAN,
  tokenIssued: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  isQR: Sequelize.BOOLEAN,
  // total token Issued, claimed (claimed>= issued = isClaimed true) isIssued = boolean
  // claimedAmount, issuedAmount, date, issuerPhone, txHash(opt) -- issued table
};

module.exports = class extends AbstractModel {
  schema = schema;
  constructor() {
    super({ tableName: "tblBeneficiaries" });
  }
};
