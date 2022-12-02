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
    try {
      const transaction = await this.table.findOne({
        where: { txHash: payload.txHash },
      });

      if (!transaction) {
        return this.table.create(payload);
      }
      return "Transaction Already Saved";
    } catch (err) {
      console.log(err);
    }
  }
};
