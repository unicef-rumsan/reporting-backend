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
    add: (req) => this.add(req.params.name, req.payload, req),
    getByName: (req) => this.getByName(req.params.name, req),
  };

  async add(name, value) {
    //checkToken(req);
    let rec = await this.table.findOne({ where: { name } });
    if (rec) {
      rec.set("value", value);
      return rec.save();
    } else return this.table.create({ name, value });
  }

  async getByName(name) {
    //checkToken(req);

    let rec = await this.table.findOne({ where: { name } });
    return rec.value;
  }
};
