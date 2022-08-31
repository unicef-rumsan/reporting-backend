const { AbstractController } = require("@rumsan/core/abstract");
const { EVENTS } = require("../../constants/appConstants");
const WSService = require("@rumsan/core/services/webSocket");
const { TransactionModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = TransactionModel;
  }

  registrations = {
    add: (req) => this.add(req.payload),
    list: (req) => this.list(),
  };

  async add(payload) {
    try {
      const transaction = await this.table.create(payload);
      WSService.broadcast(transaction, "rahat_claimed");
    } catch (err) {
      console.log(err);
    }
  }

  async list() {
    return this.table.findAll({
      order: [["createdAt", "DESC"]],
    });
  }
};
