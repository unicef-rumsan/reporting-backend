const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const { groupBy } = require("../../helpers/utils/groupByKey");
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
    getStackedGenderByWard: (req) => this.getStackedGenderByWard(req),
    groupWardByGender: (req) => this.groupWardByGender(req.query.ward, req),
    groupWardByClaim: (req) => this.groupWardByClaim(req.query.ward, req),
    groupWardByLandOwnership: (req) =>
      this.groupWardByLandOwnership(req.query.ward, req),
    groupWardByDisability: (req) =>
      this.groupWardByDisability(req.query.ward, req),
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

  async getTransactionsCountByMode() {
    let list = await this.tblTxs.findAll({
      attributes: ["mode", [this.db.Sequelize.fn("COUNT", "mode"), "value"]],
      group: ["mode"],
    });

    return list;
  }

  /**
   * Real Time Reports
   */

  async getStackedGenderByWard(req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward: {
            [Op.ne]: null,
          },
        },
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],
          "gender",
          [this.db.Sequelize.fn("COUNT", "gender"), "genderCount"],
        ],

        order: [
          ["ward", "ASC"],
          // ["gender", "ASC"],
        ],

        group: ["ward", "gender"],
      },
      req
    );

    list = JSON.parse(JSON.stringify(list));

    let itemGroup = groupBy("gender")(list);

    let grp = Object.keys(itemGroup).map((key) => {
      console.log("key", key);
      return {
        name: key,
        data: itemGroup[key].map((i) => i.genderCount),
      };
    });

    const chartLabel = list.map((item) => `Ward ${item.ward}` ?? "Unavailable");
    const chartValues = list.map((item) => +item.count);
    // let item = groupBy("ward")(list);

    // item = Object.keys(item).map((key) => {
    //   return {
    //     ward: key,
    //     m: item[key].map((item) => {
    //       return {
    //         gender: item.gender,
    //         count: item.genderCount,
    //       };
    //     }),
    //   };
    // });

    // console.log("item", JSON.stringify(item, null, 2));
    const data = {
      // allAvailableYears: yearList,
      chartLabel: [...new Set(chartLabel)],
      chartData: grp,
      // chartData: [
      //   {
      //     // year,
      //     name: "count",
      //     data: chartValues,
      //   },
      // ],
    };

    return data;
  }
  async getCountByWard(year, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward: {
            [Op.ne]: null,
          },
        },
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],
          "isClaimed",
          [this.db.Sequelize.fn("COUNT", "isClaimed"), "claimedCount"],
          // "year",
        ],

        // order: [
        //   ["ward", "ASC"],
        //   ["isClaimed", "ASC"],
        // ],

        group: [
          "ward",
          "isClaimed",
          // "year"
        ],
      },
      req
    );
    list = JSON.parse(JSON.stringify(list));

    let itemGroup = groupBy("isClaimed")(list);

    let chartData = Object.keys(itemGroup).map((key) => {
      return {
        name:
          key !== "null"
            ? key === "false"
              ? "Not Claimed"
              : "Claimed"
            : "Unknown",
        data: itemGroup[key].map((i) => i.claimedCount),
      };
    });

    const chartLabel = list.map((item) => `Ward ${item.ward}` ?? "Unavailable");

    const data = {
      chartLabel: [...new Set(chartLabel)],
      chartData,
    };

    return data;
  }

  // group ward by gender
  async _groupWardByKey(ward, groupKey, req) {
    groupKey = groupKey ?? "gender";
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward,
        },
        attributes: [
          groupKey,
          [this.db.Sequelize.fn("COUNT", "group"), "count"],
        ],
        group: [groupKey],
      },
      req
    );
    list = JSON.parse(JSON.stringify(list));
    return {
      ward,
      list,
    };
  }

  async groupWardByGender(ward, req) {
    let genderGroupList = await this._groupWardByKey(ward, "gender", req);
    const chartLabel = genderGroupList.list.map((item) => item.gender);
    const chartValues = genderGroupList.list.map((item) => item.count);
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
  async groupWardByLandOwnership(ward, req) {
    let genderGroupList = await this._groupWardByKey(ward, "noLand", req);
    const chartLabel = genderGroupList.list.map((item) =>
      item.noLand !== null ? (item.noLand ? "No Land" : "Land") : "Unknown"
    );
    const chartValues = genderGroupList.list.map((item) => item.count);
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
  async groupWardByDisability(ward, req) {
    let genderGroupList = await this._groupWardByKey(ward, "disability", req);
    const chartLabel = genderGroupList.list.map((item) =>
      item.disability !== null
        ? item.disability
          ? "Disabled"
          : "Not Disabled"
        : "Unknown"
    );
    const chartValues = genderGroupList.list.map((item) => item.count);
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

  async groupWardByClaim(ward, req) {
    let genderGroupList = await this._groupWardByKey(ward, "isClaimed", req);
    const chartLabel = genderGroupList.list.map((item) =>
      item.isClaimed !== null
        ? item.isClaimed
          ? "Claimed"
          : "Not Claimed"
        : "Unavailable"
    );
    const chartValues = genderGroupList.list.map((item) => item.count);
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

  // async _groupByPhoneOwnership(_, req) {
  //   let list = await finderByProjectId(
  //     this.tblBeneficiaries,
  //     {
  //       attributes: [
  //         "hasPhone",
  //         [this.db.Sequelize.fn("COUNT", "hasPhone"), "count"],
  //       ],
  //       group: ["hasPhone"],
  //     },
  //     req
  //   );
  //   list = JSON.parse(JSON.stringify(list));

  //   list = list.map((item) => {
  //     return {
  //       label:
  //         item.hasPhone !== null
  //           ? item.hasPhone
  //             ? "Phone"
  //             : "No Phone"
  //           : "Unavailable",
  //       value: +item.count,
  //     };
  //   });

  //   return list;
  // }

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
          item.hasBank !== null
            ? item.hasBank
              ? "Banked"
              : "Unbanked"
            : "Unavailable",
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
              ? "Phone"
              : "No Phone"
            : "Unavailable",
        value: +item.count,
      };
    });

    return list;
  }

  /**
   * End of the day
   */

  async _groupByChildrenUnder5(_, req) {
    let list = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          // age: {
          //   [Op.not]: null,
          //   // [Op.notIn]: ["u", "undefined", "x", "", null],
          // },
        },
        attributes: [
          [
            this.db.Sequelize.literal("COUNT (CASE WHEN age < 0 THEN age END)"),
            "Under 0",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 0 AND age <= 1 THEN age END)"
            ),
            "Under 2",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 1 AND age <= 2 THEN age END)"
            ),
            "Under 3",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 3 AND age <= 4 THEN age END)"
            ),
            "Under 4",
          ],
          [
            this.db.Sequelize.literal(
              "COUNT (CASE WHEN age >= 4 AND age <= 5 THEN age END)"
            ),
            "Under 5",
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
        name: "number of children",
        data: Object.values(list),
      },
    ];

    return {
      chartLabels,
      chartData,
    };
  }

  // online vs offline

  async getTransactionsCountByMethod() {
    let totalClaimed = await this.tblTxs.findAll({
      where: {
        method: {
          [Op.not]: "unavailable",
          // [Op.notIn]: ["unavailable", "undefined", "x", "", null],
        },
      },
      attributes: [
        "method",
        [this.db.Sequelize.fn("COUNT", "method"), "value"],
      ],
      group: ["method"],
    });
    totalClaimed = JSON.parse(JSON.stringify(totalClaimed));
    const chartLabel = totalClaimed.map((item) => item.method);

    const chartData = [
      {
        name: "Total Sent",
        data: totalClaimed.map((item) => +item.value * 1.5),
      },
      {
        name: "Claimed",
        data: totalClaimed.map((item) => +item.value),
      },
    ];

    return {
      chartLabel,
      chartData,
    };
  }

  async getBeneficiaryGroupingData(_, req) {
    const ageRange = await this._groupByChildrenUnder5(_, req);
    // const ageRange = await this._groupByAgeRange(_, req);
    const landOwner = await this._groupByLandOwner(_, req);
    const disability = await this._groupByDisability(_, req);
    const dailyWage = await this._groupByDailyWage(_, req);
    // const phoneOwnership = await this._groupByPhoneOwnership(_, req);
    const hasBank = await this._groupByHasBank(_, req);
    const hasPhone = await this._groupByHasPhone(_, req);

    return {
      ageRange,
      landOwner,
      disability,
      dailyWage,
      // phoneOwnership,
      hasBank,
      hasPhone,
    };
  }
};
