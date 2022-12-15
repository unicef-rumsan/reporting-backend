const config = require("config");
const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { VendorModel } = require("../models");
const checkToken = require("../../helpers/utils/checkToken");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = VendorModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(_, req),
    getById: (req) => this.getById(req.params.id, req),
    bulkAdd: (req) => this.bulkAdd(req.payload, req),
    updateTokenInfo: (req) =>
      this.updateTokenInfo(req.params.vendorId, req.payload, req),
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
      // const vendors = await this.table.findAll({});
      // const filtered = getDifferentObject(payload, vendors, "name");
      await this.table.destroy({ truncate: true });
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
    checkToken(req);

    return this.table.findByPk(id);
  }

  async updateTokenInfo(vendorId, payload, req) {
    // checkToken(req);

    const vendor = await this.table.findByPk(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    vendor.cashAllowance = payload.cashAllowance;
    vendor.tokenBalance = payload.tokenBalance;
    vendor.cashBalance = payload.cashBalance;
    vendor.save();

    return vendor;
  }
};
