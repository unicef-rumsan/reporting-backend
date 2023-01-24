const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { searchObjectKeys } = require("../../helpers/utils/searchFunctions");
const { CommunicationsModel, BeneficiaryModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super((options = {}));
    options.listeners = {};
    this.table = CommunicationsModel;
    this.tblBeneficiaries = BeneficiaryModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(req.query, req.headers.projectId),
    getById: (req) => this.getById(req.params.id, req),
    bulkAdd: (req) => this.bulkAdd(req.payload, req),
    update: (req) => this.update(req.params.sid, req.payload, req),
    getCommunicationByBeneficiaryId: (req) =>
      this.getCommunicationByBeneficiaryId(req.params.id, req),
    addCallbackUrl: (req) => this.addCallbackUrl(req.payload, req),
    updateUsingPhone: (req) =>
      this.updateUsingPhone(req.params.phone, req.payload, req),
  };

  async add(payload, req) {
    // checkToken(req);
    const beneficiary = await this.tblBeneficiaries.findOne({
      where: { phone: payload.to.replace("+977", "") },
    });

    if (beneficiary) {
      payload.beneficiaryId = beneficiary.id;
    } else {
      payload.beneficiaryId = null;
    }
    try {
      return this.table.create(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async bulkAdd(payload, req) {
    try {
      await this.table.destroy({ truncate: true });
      return this.table.bulkCreate(payload);
    } catch (err) {
      console.log(err);
    }
  }

  async list(query, projectId) {
    const { limit, start, status, showall, ...restQuery } = query;
    let customFilters = {};

    if (status) {
      customFilters.status = status;
    }

    if (!showall) {
      customFilters.beneficiaryId = {
        [Op.ne]: null,
      };
    }

    let { rows: list, count } = await finderByProjectId(
      this.table,
      {
        where: {
          ...customFilters,
          ...searchObjectKeys(restQuery),
        },
        limit: limit || 100,
        offset: start || 0,
        order: [["timestamp", "DESC"]],
        raw: true,
      },
      projectId
    );
    // const list = await this.table.findAll({});
    return {
      data: list,
      count,
      limit,
      start,
      totalPage: Math.ceil(count / limit),
    };
  }

  async getById(id, req) {
    // checkToken(req);
    return this.table.findByPk(id);
  }

  async update(sid, payload, req) {
    // checkToken(req);
    return this.table.update(payload, { where: { sid } });
  }

  async updateUsingPhone(phone, payload, req) {
    const up = await this.table.update(payload, {
      where: {
        to: phone,
      },
      returning: true,
      raw: true,
    });

    return up[1][0];
  }

  async getCommunicationByBeneficiaryId(id, req) {
    // checkToken(req);
    return this.table.findAll({ where: { beneficiaryId: id } });
  }

  async addCallbackUrl(payload, req) {
    const { CallSid, From, To, CallStatus, CallDuration, Timestamp } = payload;

    const beneficiary = await this.tblBeneficiaries.findOne({
      where: { phone: To.replace("+977", "") },
    });

    const data = {
      from: From,
      to: To,
      status: CallStatus === "completed" ? "success" : "fail",
      duration: CallDuration,
      message: "call  completed",
      timestamp: Date.parse(Timestamp),
      type: "call",
      serviceInfo: {
        sid: CallSid,
        service: "somleng",
        sipResponseCode: payload.SipResponseCode,
      },
    };

    if (beneficiary) {
      data.beneficiaryId = beneficiary.id;
    } else {
      data.beneficiaryId = null;
    }

    console.log("data", data);

    return this.table.create(data);
  }
};
