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
    getTransactionsCountByMethod: (req) =>
      this.getTransactionsCountByMethod(req),
    getTransactionsCountByMode: (req) => this.getTransactionsCountByMode(req),
    getCountByWard: (req) => this.getCountByWard(req.query.year, req),
    countGenderByWard: (req) => this.countGenderByWard(req.query.ward),
    groupClaimDistributionByWard: (req) =>
      this.groupClaimDistributionByWard(req.query.ward, req.headers.projectId),
    groupWardByGender: (req) => this.groupWardByGender(req.query.ward, req),
    groupWardByClaim: (req) => this.groupWardByClaim(req.query.ward, req),
    groupWardByLandOwnership: (req) =>
      this.groupWardByLandOwnership(req.query.ward, req),
    groupWardByDisability: (req) =>
      this.groupWardByDisability(req.query.ward, req),
    groupWardByDailyWage: (req) =>
      this.groupWardByDailyWage(req.query.ward, req),
    getBeneficiariesCounts: (req) =>
      this.getBeneficiariesCounts(req.query, req),

    getWardClaimDistributionByKey: (req) =>
      this.getWardClaimDistributionByKey(
        req.query.ward,
        req.query.filterKey,
        req
      ),
    getBeneficiaryGroupingData: (req) =>
      this.getBeneficiaryGroupingData(null, req),

    getDistributionSummary: (req) => this.getDistributionSummary(null, req),

    //#region Demographic reports

    getLandOwnerDemographicData: (req) =>
      this.getLandOwnerDemographicData(
        req.query.ward,
        req.query.filterKey,
        req.headers.projectId
      ),

    // #endregion
  };

  // reporting

  async getBeneficiaryCountByGroup() {
    const list = await this.tblBeneficiaries.findAll({
      attributes: ["group", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["group"],
    });
    return list;
  }

  async getTransactionsCountByMode(req) {
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "isOffline",
          [this.db.Sequelize.fn("COUNT", "isOffline"), "count"],
        ],
        group: ["isOffline"],
      },
      req.headers.projectId
    );

    list = JSON.parse(JSON.stringify(list));

    list = list.map((item) => ({
      isOnline:
        item.isOffline !== null
          ? item.isOffline
            ? "Offline"
            : "Online"
          : "Unknown",
      count: item.count,
    }));

    return list;
  }

  /**
   * Real Time Reports
   */

  async countGenderByWard(ward, projectId) {
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward: ward || {
            [Op.ne]: null,
          },
        },
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],
          "gender",
          [this.db.Sequelize.fn("COUNT", "gender"), "genderCount"],
        ],

        group: ["ward", "gender"],
        raw: true,
      },
      projectId
    );

    list = list.sort((a, b) => parseInt(a.ward) - parseInt(b.ward));

    let itemGroup = groupBy("ward")(list);
    let grp = Object.keys(itemGroup).map((key) => {
      return {
        ward: key,
        male: itemGroup[key].find((d) => d.gender === "M")?.count || 0,
        female: itemGroup[key].find((d) => d.gender === "F")?.count || 0,
        other: itemGroup[key].find((d) => d.gender === "O")?.count || 0,
        unknown: itemGroup[key].find((d) => d.gender === "U")?.count || 0,
      };
    });
    return grp;
  }

  async groupClaimDistributionByWard(ward, projectId) {
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward: ward || {
            [Op.ne]: null,
          },
        },
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],

          "isClaimed",
          [this.db.Sequelize.fn("COUNT", "isClaimed"), "claimedCount"],
        ],

        group: ["ward", "isClaimed"],
      },
      projectId
    );

    list = list.sort((a, b) => parseInt(a.ward) - parseInt(b.ward));

    list = JSON.parse(JSON.stringify(list));

    let itemGroup = groupBy("ward")(list);

    let grp = Object.keys(itemGroup).map((key) => {
      return {
        ward: key,
        claimed: itemGroup[key].find((d) => d.isClaimed === true)?.count || 0,
        notClaimed:
          itemGroup[key].find((d) => d.isClaimed === false)?.count || 0,
      };
    });

    return grp;
  }

  // group ward by gender
  async _groupWardByKey(ward, groupKey, req) {
    groupKey = groupKey ?? "gender";
    let { count, rows: list } = await finderByProjectId(
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
      req.headers.projectId
    );
    list = JSON.parse(JSON.stringify(list));
    return {
      ward,
      list,
      count,
    };
  }
  async _groupWardByTwoKey(ward, groupKey, groupKeyTwo, req) {
    groupKey = groupKey ?? "gender";
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward,
        },
        attributes: [
          groupKey,
          [this.db.Sequelize.fn("COUNT", "group"), "count"],
          groupKeyTwo,
          [this.db.Sequelize.fn("COUNT", "group"), "gtCount"],
        ],
        group: [groupKey, groupKeyTwo],
        raw: true,
      },
      req.headers.projectId
    );
    // list = JSON.parse(JSON.stringify(list));
    return {
      ward,
      list,
    };
  }

  async _findClaimCountOfWardByKey(ward, groupKey, req) {
    const { count, rows } = await this.tblBeneficiaries.findAndCountAll({
      where: {
        ward,
        ...groupKey,
      },
      attributes: [
        "isClaimed",
        [this.db.Sequelize.fn("COUNT", "isClaimed"), "claimedCount"],
      ],
      group: ["isClaimed"],
      raw: true,
    });
    console.log("first", groupKey);

    return {
      ...groupKey,
      claimed: count.find((d) => d.isClaimed === true)?.count || 0,
      unclaimed: count.find((d) => d.isClaimed === false)?.count || 0,
    };
  }

  async getWardClaimDistributionByKey(ward, groupKey, req) {
    const groupByKey = await this._groupWardByKey(ward, groupKey, req);

    const valueFromKeys = groupByKey.list.map((item) => item[groupKey]);

    let v = valueFromKeys.map((key) => {
      let groupKeyObj = {};
      groupKeyObj[groupKey] = key;
      return this._findClaimCountOfWardByKey(ward, groupKeyObj, req);
    });

    let result = await Promise.all(v);

    return result;
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
    const { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "gender",
          [this.db.Sequelize.fn("COUNT", "group"), "count"],
        ],
        group: ["gender"],
      },
      req.headers.projectId
    );

    return list;
  }

  async _getClaimedBeneficiaryCount(req) {
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          isClaimed: true,
        },
        attributes: [
          "isClaimed",
          [this.db.Sequelize.fn("COUNT", "group"), "count"],
        ],
        group: ["isClaimed"],
      },
      req.headers.projectId
    );

    list = JSON.parse(JSON.stringify(list))[0];
    return list;
  }

  async getBeneficiariesCounts(query, req) {
    query = query ?? {};
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,

      {
        where: query,
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
          "noLand",
          [
            this.db.Sequelize.fn("count", this.db.Sequelize.col("noLand")),
            "noLandTotal",
          ],
          "dailyWage",
          [
            this.db.Sequelize.fn("count", this.db.Sequelize.col("dailyWage")),
            "dailyWageTotal",
          ],
          "disability",
          [
            this.db.Sequelize.fn("count", this.db.Sequelize.col("disability")),
            "disabilityTotal",
          ],
          [
            // Count the total number of familySize for beneficiaries that claimed
            this.db.Sequelize.fn(
              "sum",
              this.db.Sequelize.literal(
                `CASE WHEN "isClaimed" = true THEN "familySize" ELSE 0 END`
              )
            ),
            "claimedFamilySizeTotal",
          ],
          // total number of beneficiaries remaining with isClaimed = false,
          // remaining to claim
          [
            this.db.Sequelize.fn(
              "sum",
              this.db.Sequelize.literal(
                `CASE WHEN "isClaimed" = false THEN 1 ELSE 0 END`
              )
            ),
            "unclaimedBeneficiariesTotal",
          ],
          //  total children impacted from the beneficiaries that claimed
          [
            this.db.Sequelize.fn(
              "sum",
              this.db.Sequelize.literal(
                `CASE WHEN "isClaimed" = true THEN "below5Count" ELSE 0 END`
              )
            ),
            "claimedBelow5CountTotal",
          ],
        ],
        group: [
          "familySize",
          "below5Count",
          "below5Male",
          "below5Female",
          "below5_other",
          "noLand",
          "dailyWage",
          "disability",
        ],
        raw: true,
      },
      req.headers.projectId
    );
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

    const landData = await this._wardGraphStack(null, "noLand");

    const totalNoLand = landData.reduce((acc, item) => +acc + +item.noLand, 0);
    const totalWithLand = landData.reduce(
      (acc, item) => +acc + +item.nonoLand,
      0
    );

    const dailyWageData = await this._wardGraphStack(null, "dailyWage");

    const totalDailyWage = dailyWageData.reduce(
      (acc, item) => +acc + +item.dailyWage,
      0
    );

    const totalNonDailyWage = dailyWageData.reduce(
      (acc, item) => +acc + +item.nodailyWage,
      0
    );

    const disabilityData = await this._wardGraphStack(null, "disability");

    const totalDisability = disabilityData.reduce(
      (acc, item) => +acc + +item.disability,
      0
    );

    const totalClaimed = await this._getClaimedBeneficiaryCount(req);
    const totalNoLandCalc = totalNoLand - totalNonDailyWage;

    const claimedFamilySizeTotal = list.reduce(
      (acc, item) => +acc + +item.claimedFamilySizeTotal,
      0
    );

    const unclaimedBeneficiariesTotal = list.reduce(
      (acc, item) => +acc + +item.unclaimedBeneficiariesTotal,
      0
    );

    const claimedBelow5CountTotal = list.reduce(
      (acc, item) => +acc + +item.claimedBelow5CountTotal,
      0
    );

    const data = {
      impacted: {
        totalFamilyCount,
        totalBelow5Count,
        totalBelow5Male,
        totalBelow5Female,
        totalBelow5Other,
        totalClaimed: totalClaimed ? totalClaimed.count : 0,
        totalNoLand: totalNoLandCalc,
        totalWithLand,
        totalDailyWage,
        totalDisability: totalNoLandCalc - totalDisability,
        claimedFamilySizeTotal,
        unclaimedBeneficiariesTotal,
        claimedBelow5CountTotal,
      },
    };

    return data;
  }

  async _groupByAgeRange(_, req) {
    let { rows: list } = await finderByProjectId(
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
      req.headers.projectId
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
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "noLand",
          [this.db.Sequelize.fn("COUNT", "noLand"), "count"],
        ],
        group: ["noLand"],
      },
      req.headers.projectId
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
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "disability",
          [this.db.Sequelize.fn("COUNT", "disability"), "count"],
        ],
        group: ["disability"],
      },
      req.headers.projectId
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
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "dailyWage",
          [this.db.Sequelize.fn("COUNT", "dailyWage"), "count"],
        ],
        group: ["dailyWage"],
      },
      req.headers.projectId
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
  //   let { rows: list } = await finderByProjectId(
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
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "hasBank",
          [this.db.Sequelize.fn("COUNT", "hasBank"), "count"],
        ],
        group: ["hasBank"],
      },
      req.headers.projectId
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
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        attributes: [
          "hasPhone",
          [this.db.Sequelize.fn("COUNT", "hasPhone"), "count"],
        ],
        group: ["hasPhone"],
      },
      req.headers.projectId
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
    let { rows: list } = await finderByProjectId(
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
      req.headers.projectId
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

  async getTransactionsCountByMethod(req) {
    // ben table

    let { rows: totalClaimedQR } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          isQR: {
            [Op.not]: null,
          },
          // isClaimed: true,
        },
        // attributes: ["isQR", [this.db.Sequelize.fn("COUNT", "isQR"), "value"]],

        // group: ["isQR"],
      },
      req.headers.projectId
    );

    totalClaimedQR = JSON.parse(JSON.stringify(totalClaimedQR));

    let itemGroup = groupBy("isQR")(totalClaimedQR);

    let counts = Object.keys(itemGroup).map((key) => {
      return itemGroup[key].reduce(
        (acc, cur) => acc + parseInt(cur.tokenIssued),
        0
      );
    });

    let totalIssued = totalClaimedQR.length * 1000;

    const chartLabel = Object.keys(itemGroup).map((key) =>
      JSON.parse(key) ? "QR" : "SMS"
    );

    const chartData = [
      {
        name: "Total Sent",
        data: [totalIssued, totalIssued],
      },
      {
        name: "Claimed",
        data: counts,
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

  // #region demographic reports

  async _wardGraphStack(ward, filterKey, projectId) {
    let { rows: list } = await finderByProjectId(
      this.tblBeneficiaries,
      {
        where: {
          ward: ward || {
            [Op.ne]: null,
          },
        },
        attributes: [
          "ward",
          [this.db.Sequelize.fn("COUNT", "ward"), "count"],

          filterKey,
          [this.db.Sequelize.fn("COUNT", filterKey), `${filterKey}Count`],
        ],

        group: ["ward", filterKey],
      },
      projectId
    );

    list = list.sort((a, b) => parseInt(a.ward) - parseInt(b.ward));

    list = JSON.parse(JSON.stringify(list));

    let itemGroup = groupBy("ward")(list);

    return Object.keys(itemGroup).map((key) => {
      if (typeof itemGroup[key][0][filterKey] === "boolean") {
        return {
          ward: key,
          [`no${filterKey}`]:
            itemGroup[key].find((d) => d[filterKey] === false)?.count || 0,
          [filterKey]:
            itemGroup[key].find((d) => d[filterKey] === true)?.count || 0,
        };
      } else if (typeof itemGroup[key][0][filterKey] === "string") {
        let obj = {};

        for (let i = 0; i < itemGroup[key].length; i++) {
          const element = itemGroup[key][i];
          obj[element[filterKey]] = element[`${filterKey}Count`];
        }
        return {
          ward: key,
          ...obj,
        };
      }
    });
  }

  async getLandOwnerDemographicData(ward, filterKey, projectId) {
    // filterKey = filterKey || "noLand";
    const data = await this._wardGraphStack(ward, filterKey, projectId);

    return data;
  }

  async getDistributionSummary() {
    const issueCount = await this.tblBeneficiaries.findAll({
      where: { totalTokenIssued: { [Op.gt]: 0 } },
      attributes: [
        "hasBank",
        [this.db.Sequelize.fn("COUNT", "hasBank"), "count"],
      ],

      group: ["hasBank"],
      raw: true,
    });
    const cashCount = await this.tblBeneficiaries.findAll({
      where: { cashBalance: { [Op.gt]: 0 } },
      attributes: [
        "hasBank",
        [this.db.Sequelize.fn("COUNT", "hasBank"), "count"],
      ],

      group: ["hasBank"],
      raw: true,
    });

    const data = {
      issuedToBanked: issueCount.find((d) => d.hasBank === true)?.count || 0,
      issuedToUnbanked: issueCount.find((d) => d.hasBank === false)?.count || 0,
      cashToBanked: cashCount.find((d) => d.hasBank === true)?.count || 0,
      cashToUnbanked: cashCount.find((d) => d.hasBank === false)?.count || 0,
    };
    return data;
  }

  // #endregion
};
