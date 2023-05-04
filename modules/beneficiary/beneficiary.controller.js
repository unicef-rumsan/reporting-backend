const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { Op } = require("sequelize");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { searchObjectKeys } = require("../../helpers/utils/searchFunctions");
const {
  BeneficiaryModel,
  TransactionClaimERCCacheModel,
} = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = BeneficiaryModel;
    this.tblClaimTransactions = TransactionClaimERCCacheModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(req.query, req.headers.projectId),
    getById: (req) => this.getById(req.params.id, req),
    bulkAdd: (req) => this.bulkAdd(req.payload, req),
    updateExplorerTokenInfo: (req) =>
      this.updateExplorerTokenInfo(
        req.params.beneficiaryPhone,
        req.payload,
        req
      ),
    getBeneficiaryCountByGroup: (req) => this.getBeneficiaryCountByGroup(),
    getBeneficiaryCountByGender: (req) => this.getBeneficiaryCountByGender(),
    getBeneficiaryByWard: (req) =>
      this.getBeneficiaryByWard(req.query.ward, req.headers.projectId),
    updateTokenInfo: (req) =>
      this.updateTokenInfo(req.params.beneficiaryPhone, req.payload, req),
  };

  async add(payload, req) {
    // checkToken(req);
    try {
      return this.table.create(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async bulkAdd(payload, req) {
    // const beneficiaries = await this.table.findAll({});
    // const filtered = getDifferentObject(payload, beneficiaries, "phone");
    // checkToken(req);
    try {
      await this.table.destroy({ truncate: true });
      return this.table.bulkCreate(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async list(query, projectId) {
    const { limit, start, cashReceived, ward, ...restQuery } = query;

    const searchQuery = {};

    // checkToken(req);
    let { rows: list, count } = await finderByProjectId(
      this.table,
      {
        where: ward
          ? { ward, ...searchObjectKeys(restQuery) }
          : searchObjectKeys(restQuery),
        limit: limit || 100,
        offset: start || 0,
      },
      projectId
    );
    list = JSON.parse(JSON.stringify(list));
    // const list = await this.table.findAll({});
    return {
      data: list,
      count,
      limit,
      start,
      totalPage: Math.ceil(count / limit),
      searchingBy: restQuery,
    };
  }

  async getById(id, req) {
    checkToken(req);
    return this.table.findByPk(id);
  }

  async updateTokenInfo(beneficiaryPhone, payload, req) {
    // checkToken(req);

    const beneficiary = await this.table.findOne({
      where: { phone: beneficiaryPhone },
    });
    if (beneficiary) {
      beneficiary.cashBalance = payload.cashBalance;
      beneficiary.tokenBalance = payload.tokenBalance;
      beneficiary.totalTokenIssued = payload.totalTokenIssued;
      beneficiary.isClaimed = payload.cashBalance > 0 ? true : false;
      beneficiary.save();
    }
    return beneficiary;
  }

  async updateExplorerTokenInfo(phone, payload, req) {
    const { isOffline, tokenIssued } = payload;

    const beneficiary = await this.table.findOne({ where: { phone } });

    if (beneficiary) {
      // beneficiary.isClaimed = isClaimed;
      beneficiary.isOffline = isOffline;
      beneficiary.tokenIssued = tokenIssued;
      beneficiary.save();
    }
    return beneficiary;
  }

  // reporting

  async getBeneficiaryCountByGroup() {
    const list = await this.table.findAll({
      attributes: ["group", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["group"],
    });
    return list;
  }

  async getBeneficiaryCountByGender() {
    const list = await this.table.findAll({
      attributes: ["gender", [this.db.Sequelize.fn("COUNT", "group"), "count"]],
      group: ["gender"],
    });
    return list;
  }

  async _replaceWithBeneficiaryName(list) {
    const phonesList = list.map((item) => item.beneficiary);
    const beneficiaryList = await this.table.findAll({
      where: {
        phone: {
          [Op.in]: phonesList,
        },
      },
      attributes: ["name", "phone", "ward", "isQR", "isOffline"],
      raw: true,
    });
    const beneficiaryMapped = list.map((item) => {
      let benef = beneficiaryList.find((b) => b.phone === item.beneficiary);
      return {
        ...item,
        ...benef,
      };
    });

    return beneficiaryMapped;
  }

  async getBeneficiaryByWard(ward, projectId) {
    let { rows, count } = await finderByProjectId(
      this.table,
      {
        where: { ward, isClaimed: true },
        raw: true,
      },
      projectId
    );

    // beneficiaries = JSON.parse(JSON.stringify(beneficiaries));

    const beneficiaryPhones = rows.map((b) => b.phone);

    // const transactions = await this.tblClaimTransactions.findAll({
    //   where: {
    //     beneficiary: {
    //       [Op.in]: beneficiaryPhones,
    //     },
    //   },
    //   // attributes: ["name", "phone"],
    //   raw: true,
    // });

    const ben = rows.map((r) => {
      // const tr = transactions.find((d) => d.beneficiary === r.phone);
      return {
        ...r,
        // ...tr,
      };
    });
    // const remainingBeneficiaries = rows.filter(
    //   (b) => !transactions.find((t) => t.beneficiary === b.phone)
    // );

    const remainingBeneficiaries = rows?.filter((b) => !b.isClaimed);

    return {
      data: ben,
      count,
      numOfBenefRemainingToClaim: remainingBeneficiaries.length,
    };
  }
};
