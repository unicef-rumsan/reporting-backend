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
    const { limit, start, status, ...restQuery } = query;
    let customFilters = {};

    if (status) {
      customFilters.status = status;
    }

    let { rows: list, count } = await finderByProjectId(
      this.table,
      {
        where: {
          beneficiaryId: {
            [Op.ne]: null,
          },
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
    console.log("sid", sid);
    // checkToken(req);
    return this.table.update(payload, { where: { sid } });
  }

  async getCommunicationByBeneficiaryId(id, req) {
    // checkToken(req);
    return this.table.findAll({ where: { beneficiaryId: id } });
  }

  async addCallbackUrl(payload, req) {
    // {
    //   CallSid: '85cab075-01d1-492a-a4ab-482c7401533a',
    //   AccountSid: '4d741335-4843-44e2-b4f5-8d22cdaa7687',
    //   From: '+9779801230044',
    //   To: '+9779801109670',
    //   CallStatus: 'completed',
    //   ApiVersion: '2010-04-01',
    //   Direction: 'outbound-api',
    //   CallDuration: '15',
    //   SipResponseCode: '200',
    //   CallbackSource: 'call-progress-events',
    //   Timestamp: 'Mon, 23 Jan 2023 07:20:10 -0000',
    //   SequenceNumber: '0'
    // }
    const { CallSid, From, To, CallStatus, CallDuration, Timestamp } = payload;
    const data = {
      from: From,
      to: To,
      status: CallStatus === "completed" ? "success" : "fail",
      duration: CallDuration,
      timestamp: Date.parse(Timestamp),
      type: "call",
      serviceInfo: {
        sid: CallSid,
        service: "somleng",
        sipResponseCode: payload.SipResponseCode,
      },
    };

    console.log("data", { data, payload });

    const call = await this.table.findOne({
      where: {
        serviceInfo: {
          [Op.contains]: {
            sid: data.serviceInfo.sid,
          },
        },
      },
    });

    if (call) {
      return this.table.update(
        { status: data.status, duration: data.duration },
        {
          where: {
            serviceInfo: {
              [Op.contains]: {
                sid: data.serviceInfo.sid,
              },
            },
          },
        }
      );
    } else {
      return this.table.create(data);
    }
  }
};
