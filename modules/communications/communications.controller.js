const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const moment = require("moment");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { searchObjectKeys } = require("../../helpers/utils/searchFunctions");
const { CommunicationsModel, BeneficiaryModel } = require("../models");
const {
  // findMatchingObjects,
  findMatchingObject,
} = require("../../helpers/utils/array");

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
    update: (req) => this.update(req.params.id, req.payload, req),
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
    const {
      limit,
      start,
      status,
      showall,
      hasBank,
      ward,
      type,
      phone,
      ...restQuery
    } = query;
    let customFilters = {};

    if (status) {
      customFilters.status = status;
    }

    if (type) {
      customFilters.type = type;
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

    if (hasBank !== undefined || ward) {
      // const beneficiaryIds = list.map((item) => item.beneficiaryId);

      const beneficiaries = await this.tblBeneficiaries.findAll({
        // where: {
        //   id: { [Op.in]: beneficiaryIds },
        // },
        raw: true,
      });

      if (hasBank !== undefined) {
        list = list.filter((item) => {
          const beneficiary = beneficiaries?.find(
            (ben) => ben.id === item?.beneficiaryId
          );
          if (!beneficiary) return false;
          return beneficiary.hasBank === JSON.parse(hasBank);
        });
      }

      if (ward) {
        // find all the items in the list with the same ward
        list = list.filter((item) => {
          const beneficiary = beneficiaries?.find(
            (ben) => ben.id === item?.beneficiaryId
          );
          if (!beneficiary) return false;
          return beneficiary.ward === ward;
        });
      }
    }

    // js function to filter out the list from the object of diffret keys

    // const list = await this.table.findAll({});
    return {
      data: list,
      count,
      limit,
      start,
      totalPage: Math.ceil(count / limit),
      filter: {
        status,
        type,
        ward,
        hasBank,
        phone,

        ...restQuery,
      },
    };
  }

  async getById(id, req) {
    // checkToken(req);
    return this.table.findByPk(id);
  }

  async update(id, payload, req) {
    // checkToken(req);
    return this.table.update(payload, {
      where: { id },
      returning: true,
      raw: true,
    });
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
      timestamp: moment(Timestamp).unix(),
      type: "call",
      serviceInfo: {
        sid: CallSid,
        service: "somleng",
        sipResponseCode: payload.SipResponseCode,
      },
    };

    // console.log("data", data);

    if (beneficiary) {
      data.beneficiaryId = beneficiary.id;
    } else {
      data.beneficiaryId = null;
    }

    console.log("data", data);

    return this.table.create(data);
  }
};
