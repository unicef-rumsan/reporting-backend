const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const checkToken = require("../../helpers/utils/checkToken");
const { ProjectModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = ProjectModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(_, req),
    getById: (req) => this.getById(req.params.id, req),
    bulkAdd: (req) => this.bulkAdd(req.payload, req),
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

  async list(_, req) {
    // checkToken(req);
    const list = await this.table.findAll({});
    return list;
  }

  async getById(id, req) {
    // checkToken(req);
    return this.table.findByPk(id);
  }
};
