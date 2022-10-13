const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const {
  BeneficiaryModel,
  TransactionClaimERCCacheModel,
} = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.tblBeneficiaries = BeneficiaryModel;
    this.tblTxs = TransactionClaimERCCacheModel;
  }

  registrations = {
    getBeneficiaryCountByGroup: () => this.getBeneficiaryCountByGroup(),
    getBeneficiaryCountByGender: () => this.getBeneficiaryCountByGender(),
    getTransactionsCountByMethod: () => this.getTransactionsCountByMethod(),
    getTransactionsCountByMode: () => this.getTransactionsCountByMode(),
    getCountByWard: (req) => this.getCountByWard(req.query.year),
  };

  // reporting

  async getBeneficiaryCountByGroup() {
    const list = await this.tblBeneficiaries.findAll({
      attributes: ["group", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["group"],
    });
    return list;
  }

  async getBeneficiaryCountByGender() {
    const list = await this.tblBeneficiaries.findAll({
      attributes: ["gender", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["gender"],
    });
    return list;
  }

  async getTransactionsCountByMethod() {
    const list = await this.tblTxs.findAll({
      attributes: [
        "method",
        [this.db.Sequelize.fn("COUNT", "method"), "value"],
      ],
      group: ["method"],
    });
    return list;
  }
  async getTransactionsCountByMode() {
    const list = await this.tblTxs.findAll({
      attributes: ["mode", [this.db.Sequelize.fn("COUNT", "mode"), "value"]],
      group: ["mode"],
    });
    return list;
  }

  async getCountByWard(year) {
    let list = await this.tblTxs.findAll({
      where: { year },
      attributes: [
        "ward",
        [this.db.Sequelize.fn("COUNT", "ward"), "count"],
        "year",
      ],

      group: ["ward", "year"],
    });

    const yearList = [
      ...new Set(
        JSON.parse(JSON.stringify(await this.tblTxs.findAll({}))).map(
          (i) => i.year
        )
      ),
    ];

    list = JSON.parse(JSON.stringify(list));

    const chartLabel = list.map((item) => item.ward);
    const chartValues = list.map((item) => item.count);
    const data = {
      allAvailableYears: yearList,
      chartLabel,
      chartData: [
        {
          year,
          name: "count",
          data: chartValues,
        },
      ],
    };

    return data;
  }
};
