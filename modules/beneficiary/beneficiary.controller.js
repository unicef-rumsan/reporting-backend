const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const checkToken = require("../../helpers/utils/checkToken");
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
    getBeneficiaryCountByGroup: (req) => this.getBeneficiaryCountByGroup(),
    getBeneficiaryCountByGender: (req) => this.getBeneficiaryCountByGender(),
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
    // checkToken(req);
    try {
      return this.table.bulkCreate(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async list(a, req) {
    // checkToken(req);
    const list = await this.table.findAll({});
    return list;
  }

  async getById(id, req) {
    checkToken(req);
    return this.table.findByPk(id);
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
};
