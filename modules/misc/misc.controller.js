const config = require("config");
const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { MiscModel, BeneficiaryModel, VendorModel } = require("../models");
const checkToken = require("../../helpers/utils/checkToken");

module.exports = class extends AbstractController {
  constructor(options = {}) {
    super(options);
    options.listeners = {};
    this.table = MiscModel;
  }

  registrations = {
    add: (req) => this.add(req.params.name, req.payload, req),
    getByName: (req) => this.getByName(req.params.name, req),
  };

  async add(name, value) {
    //checkToken(req);

    try {
      if (name === "cash-tracker-summary") {
        let totalBenCashBalance = await BeneficiaryModel.findAll({
          attributes: [
            [
              this.db.Sequelize.fn("sum", this.db.Sequelize.col("cashBalance")),
              "totalBenCashBalance",
            ],
          ],
          raw: true,
        });

        let totalVendorTokenBalance = await VendorModel.findAll({
          attributes: [
            [
              this.db.Sequelize.fn(
                "sum",
                this.db.Sequelize.col("tokenBalance")
              ),
              "totalVendorTokenBalance",
            ],
          ],
          raw: true,
        });

        let totalVendorCashBalance = await VendorModel.findAll({
          attributes: [
            [
              this.db.Sequelize.fn("sum", this.db.Sequelize.col("cashBalance")),
              "totalVendorCashBalance",
            ],
          ],
          raw: true,
        });

        totalBenCashBalance = parseInt(
          totalBenCashBalance[0].totalBenCashBalance
        );
        totalVendorTokenBalance = parseInt(
          totalVendorTokenBalance[0].totalVendorTokenBalance
        );
        totalVendorCashBalance = parseInt(
          totalVendorCashBalance[0].totalVendorCashBalance
        );
        let totalVendorCashReceived =
          totalVendorTokenBalance + totalVendorCashBalance;

        value.wards.received = totalVendorCashReceived;
        value.wards.disbursed = totalVendorTokenBalance;
        value.beneficiaries.received = totalBenCashBalance;
      }
    } catch (e) {}

    let rec = await this.table.findOne({ where: { name } });
    if (rec) {
      rec.set("value", value);
      return rec.save();
    } else return this.table.create({ name, value });
  }

  async getByName(name) {
    //checkToken(req);

    let rec = await this.table.findOne({ where: { name } });
    return rec.value;
  }
};
