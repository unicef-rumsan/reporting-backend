const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { BeneficiaryModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = BeneficiaryModel;
  }

  registrations = {
    add: (req) => this.add(req.payload),
    list: (req) => this.list(),
    getById: (req) => this.getById(req.params.id),
  };

  async add(payload) {
    try {
      return this.table.create(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async list() {
    const list = await this.table.findAll({});
    return list;
  }

  async getById(id) {
    return this.table.findByPk(id);
  }
};
