const { AbstractController } = require("@rumsan/core/abstract");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { IssuedTokensModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = IssuedTokensModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
  };

  async add(payload, req) {
    // checkToken(req);
    try {
      return this.table.create(payload);
    } catch (err) {
      console.log(err);
    }
  }
};
