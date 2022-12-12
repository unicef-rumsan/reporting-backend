const config = require("config");
const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { MiscModel } = require("../models");
const checkToken = require("../../helpers/utils/checkToken");

module.exports = class extends AbstractController {
  constructor(options = {}) {
    super(options);
    options.listeners = {};
    this.table = MiscModel;
  }

  registrations = {
    add: (req) => this.add(req.payload.name, req.payload.value, req),
    getByName: (req) => this.getByName(req.params.name, req),
  };

  async add(name, value) {
    //checkToken(req);
    try {
      return this.table.create({ name, value });
    } catch (err) {
      console.log(err);
    }
  }

  async getByName(name) {
    //checkToken(req);

    return this.table.findOne({ where: { name } });
  }
};
