const config = require("config");
const { AbstractController } = require("@rumsan/core/abstract");
const WSService = require("@rumsan/core/services/webSocket");
const { VendorModel } = require("../models");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = VendorModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(req.query, req.headers.projectId),
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

  async list(query, projectId) {
    const { limit, start, ...restQuery } = query;
    // checkToken(req);
    let { rows: list, count } = await finderByProjectId(
      this.table,
      {
        where: { ...restQuery },
        limit: limit || 100,
        offset: start || 0,
      },
      projectId
    );
    return {
      data: list,
      count,
      limit,
      start,
      totalPage: Math.ceil(count / limit),
    };
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
    vendor.hasVendorRole = payload.hasVendorRole;
    vendor.save();

    return vendor;
  }
};
