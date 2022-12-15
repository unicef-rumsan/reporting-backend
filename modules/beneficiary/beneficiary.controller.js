const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const checkToken = require("../../helpers/utils/checkToken");
const getDifferentObject = require("../../helpers/utils/getDifferentObject");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { BeneficiaryModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = BeneficiaryModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(req.query, req),
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
      this.getBeneficiaryByWard(req.query.ward, req),
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

  async list(a, req) {
    // checkToken(req);
    const list = await finderByProjectId(this.table, a, req.headers.projectId);
    // const list = await this.table.findAll({});
    return list;
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
      beneficiary.save();
    }
    return beneficiary;
  }

  async updateExplorerTokenInfo(phone, payload, req) {
    const { isClaimed, isOffline, tokenIssued } = payload;

    const beneficiary = await this.table.findOne({ where: { phone } });

    if (beneficiary) {
      beneficiary.isClaimed = isClaimed;
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

  async getBeneficiaryByWard(ward, req) {
    const list = await finderByProjectId(
      this.table,
      {
        where: { ward },
      },
      req.headers.projectId
    );
    return list;
  }
};
