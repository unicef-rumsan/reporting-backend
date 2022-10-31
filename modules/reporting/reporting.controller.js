const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
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
    getBeneficiaryCountByGender: (req) => this.getBeneficiaryCountByGender(req),
    getTransactionsCountByMethod: () => this.getTransactionsCountByMethod(),
    getTransactionsCountByMode: () => this.getTransactionsCountByMode(),
    getCountByWard: (req) => this.getCountByWard(req.query.year, req),
    getBeneficiariesCounts: (req) => this.getBeneficiariesCounts(null, req),
    getBeneficiaryGroupingData: (req) =>
      this.getBeneficiaryGroupingData(null, req),
  };

  // reporting

  async getBeneficiaryCountByGroup() {
    const list = await this.tblBeneficiaries.findAll({
      attributes: ["group", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["group"],
    });
    return list;
  }

  async getBeneficiaryCountByGender(req) {
    const list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "gender",
          [this.db.Sequelize.fn("COUNT", "group"), "count"],
        ],
        group: ["gender"],
      },
      req
    );

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

  async getCountByWard(year, req) {
    // year = year || new Date().getFullYear();
    // const list = await finderByProjectId(this.tblTxs)
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],
          // "year",
        ],

        order: [["ward", "ASC"]],

        group: [
          "ward",
          // "year"
        ],
      },
      req
    );

    // const yearList = [
    //   ...new Set(
    //     JSON.parse(JSON.stringify(await this.tblTxs.findAll({}))).map(
    //       (i) => i.year
    //     )
    //   ),
    // ];

    list = JSON.parse(JSON.stringify(list));

    const chartLabel = list.map((item) => item.ward ?? "Unavailable");
    const chartValues = list.map((item) => +item.count);
    const data = {
      // allAvailableYears: yearList,
      chartLabel,
      chartData: [
        {
          // year,
          name: "count",
          data: chartValues,
        },
      ],
    };

    return data;
  }

  async getBeneficiariesCounts(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "familySize",
          [
            this.db.Sequelize.fn("sum", this.db.Sequelize.col("familySize")),
            "familySizeTotal",
          ],
          "below5Count",
          [
            this.db.Sequelize.fn("sum", this.db.Sequelize.col("below5Count")),
            "below5CountTotal",
          ],
          "below5Male",
          [
            this.db.Sequelize.fn("sum", this.db.Sequelize.col("below5Male")),
            "below5MaleTotal",
          ],
          "below5Female",
          [
            this.db.Sequelize.fn("sum", this.db.Sequelize.col("below5Female")),
            "below5FemaleTotal",
          ],
          "below5_other",
          [
            this.db.Sequelize.fn("sum", this.db.Sequelize.col("below5_other")),
            "below5_otherTotal",
          ],
        ],
        group: [
          "familySize",
          "below5Count",
          "below5Male",
          "below5Female",
          "below5_other",
        ],
      },
      req
    );
    list = JSON.parse(JSON.stringify(list));
    const totalFamilyCount = list.reduce(
      (acc, item) => +acc + +item.familySizeTotal,
      0
    );
    const totalBelow5Count = list.reduce(
      (acc, item) => +acc + +item.below5CountTotal,
      0
    );
    const totalBelow5Male = list.reduce(
      (acc, item) => +acc + +item.below5MaleTotal,
      0
    );
    const totalBelow5Female = list.reduce(
      (acc, item) => +acc + +item.below5FemaleTotal,
      0
    );
    const totalBelow5Other = list.reduce(
      (acc, item) => +acc + +item.below5_otherTotal,
      0
    );

    const data = {
      impacted: {
        totalFamilyCount,
        totalBelow5Count,
        totalBelow5Male,
        totalBelow5Female,
        totalBelow5Other,
      },
    };

    return data;
  }

  async _groupByAgeRange(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          // age: {
          // [Op.not]: null,
          // [Op.notIn]: ["u", "undefined", "x", "", null],
          // },
        },
        attributes: [
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age < 20 THEN age END)"
            ),
            "<20",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 20 AND age <= 29 THEN age END)"
            ),
            "20-29",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 30 AND age <= 39 THEN age END)"
            ),
            "30-39",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 40 AND age <= 49 THEN age END)"
            ),
            "40-49",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 50 THEN age END)"
            ),
            "≥50",
          ],
          // [
          //   this.db.Sequelize.fn("count", this.db.Sequelize.col("age")),
          //   "count",
          // ],
        ],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list))[0];

    const chartLabels = Object.keys(list);
    const chartData = [
      {
        name: "number of beneficiaries",
        data: Object.values(list),
      },
    ];

    return {
      chartLabels,
      chartData,
    };
  }

  async _groupByLandOwner(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "noLand",
          [this.db.Sequelize.fn("COUNT", "noLand"), "count"],
        ],
        group: ["noLand"],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.noLand !== null ? (item.noLand ? "Yes" : "No") : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  async _groupByDisability(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "disability",
          [this.db.Sequelize.fn("COUNT", "disability"), "count"],
        ],
        group: ["disability"],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.disability !== null
            ? item.disability
              ? "Yes"
              : "No"
            : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  async _groupByDailyWage(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "dailyWage",
          [this.db.Sequelize.fn("COUNT", "dailyWage"), "count"],
        ],
        group: ["dailyWage"],
      },
      req
    );
    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.dailyWage !== null
            ? item.dailyWage
              ? "Yes"
              : "No"
            : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  async _groupByPhoneOwnership(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "hasPhone",
          [this.db.Sequelize.fn("COUNT", "hasPhone"), "count"],
        ],
        group: ["hasPhone"],
      },
      req
    );
    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.hasPhone !== null
            ? item.hasPhone
              ? "Yes"
              : "No"
            : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  async _groupByHasBank(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "hasBank",
          [this.db.Sequelize.fn("COUNT", "hasBank"), "count"],
        ],
        group: ["hasBank"],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.hasBank !== null ? (item.hasBank ? "Yes" : "No") : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }
  async _groupByHasPhone(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "hasPhone",
          [this.db.Sequelize.fn("COUNT", "hasPhone"), "count"],
        ],
        group: ["hasPhone"],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => {
      return {
        label:
          item.hasPhone !== null
            ? item.hasPhone
              ? "Yes"
              : "No"
            : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  async getBeneficiaryGroupingData(_, req) {
    const ageRange = await this._groupByAgeRange(_, req);
    const landOwner = await this._groupByLandOwner(_, req);
    const disability = await this._groupByDisability(_, req);
    const dailyWage = await this._groupByDailyWage(_, req);
    const phoneOwnership = await this._groupByPhoneOwnership(_, req);
    const hasBank = await this._groupByHasBank(_, req);
    const hasPhone = await this._groupByHasPhone(_, req);

    return {
      ageRange,
      landOwner,
      disability,
      dailyWage,
      phoneOwnership,
      hasBank,
      hasPhone,
    };
  }
};
