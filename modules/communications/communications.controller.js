const { AbstractController } = require("@rumsan/core/abstract");
const { Op } = require("sequelize");
const moment = require("moment");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { searchObjectKeys } = require("../../helpers/utils/searchFunctions");
const {
  CommunicationsModel,
  BeneficiaryModel,
  JaleshworCommunicationModel,
} = require("../models");
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
    this.tblJswCommunications = JaleshworCommunicationModel;
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
    getJswCommList: (req) => this.getJswCommList(req.query),
    addJlsComm: (req) => this.addJlsComm(req.payload),
    getJswCommByPhone: (req) => this.getJswCommByPhone(req.params.phone),
  };

  async add(payload) {
    // checkToken(req);
    const beneficiary = await this.tblBeneficiaries.findOne({
      where: { phone: payload.to.replace("+977", "") },
    });

    console.log("payload", payload);

    // if (beneficiary) {
    payload.beneficiaryId = beneficiary.id;

    let jaleshworCommunicationData = {};

    jaleshworCommunicationData = {
      type: payload.type,
      status: payload.status,
      duration: payload.duration,
      timestamp: payload.timestamp,
      ward: beneficiary.ward,
      hasBank: beneficiary.hasBank,
      to: payload.to,
      from: payload.from,
    };

    console.log("jal", jaleshworCommunicationData);

    await this.addJlsComm(payload);
    // } else {
    //   payload.beneficiaryId = null;
    // }
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

    // const beneficiary = await this.tblBeneficiaries.findOne({
    //   where: { phone: To.replace("+977", "") },
    // });

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

    // if (beneficiary) {
    //   data.beneficiaryId = beneficiary.id;
    // } else {
    //   data.beneficiaryId = null;
    // }

    return this.add(data);
  }

  async getJswCommList(params) {
    // console.log("params", params);
    const { limit, start, type, ward, status, ...restQuery } = params;

    let otherFilters = {};

    if (type) {
      otherFilters.type = type;
    }

    if (ward) {
      otherFilters.ward = ward;
    }

    if (status) {
      otherFilters.status = status;
    }

    let { rows: data, count } = await this.tblJswCommunications.findAndCountAll(
      {
        attributes: [
          "to",
          [
            this.db.Sequelize.fn("COUNT", this.db.Sequelize.col("status")),
            "numberOfAttempts",
          ],
          "status",
          "timestamp",
          "hasBank",
          "ward",
          "duration",
          "type",
          "beneficiaryId",
        ],
        where: {
          ...otherFilters,
          ...searchObjectKeys(restQuery),
          // status: {d
          //   [Op.ne]: "success",
          // },
        },
        limit: limit || 200,

        offset: start || 0,
        order: [["timestamp", "DESC"]],
        group: [
          "to",
          "status",
          "timestamp",
          "hasBank",
          "ward",
          "duration",
          "type",
          "beneficiaryId",
        ],
        raw: true,
      }
    );

    function transformData(data) {
      const transformedData = [];

      // group data by 'to' phone number
      const phoneGroups = data.reduce((groups, item) => {
        if (!groups[item.to]) {
          groups[item.to] = [];
        }
        groups[item.to].push(item);
        return groups;
      }, {});

      // loop through each phone group
      for (let phoneNumber in phoneGroups) {
        const phoneData = phoneGroups[phoneNumber];

        // sort phone data by timestamp in descending order
        phoneData.sort((a, b) => b.timestamp - a.timestamp);

        // calculate number of attempts
        const numberOfAttempts = phoneData.length;

        // get latest status and timestamp
        const latestStatus = phoneData[0].status;
        const latestTimestamp = phoneData[0].timestamp;

        // push transformed data to array
        transformedData.push({
          to: phoneNumber,
          numberOfAttempts: numberOfAttempts,
          status: latestStatus,
          timestamp: latestTimestamp,
          hasBank: phoneData[0].hasBank,
          ward: phoneData[0].ward,
          duration: phoneData[0].duration,
          type: phoneData[0].type,
          beneficiaryId: phoneData[0].beneficiaryId,
        });
      }

      return transformedData;
    }

    data = transformData(data);

    return {
      data,
      count: count?.length,
      limit: limit || 100,
      start: start || 0,
      totalPage: Math.ceil(count / (limit || 100)),
      filter: {
        ...restQuery,
      },
    };
    // console.log("params", params);
    // const { limit, start, ...restQuery } = params;
    // const { rows: list, count } =
    //   await this.tblJswCommunications.findAndCountAll({
    //     where: {
    //       ...searchObjectKeys(restQuery),
    //     },
    //     limit: limit || 100,

    //     offset: start || 0,
    //     order: [["timestamp", "DESC"]],
    //     raw: true,
    //   });

    // return {
    //   data: list,
    //   count,
    //   limit: limit || 100,
    //   start: start || 0,
    //   totalPage: Math.ceil(count / (limit || 100)),
    //   filter: {
    //     ...restQuery,
    //   },
    // };
  }

  async addJlsComm(payload) {
    const created = await this.tblJswCommunications.create(payload);
    return created;
  }

  async getJswCommByPhone(phone) {
    return this.tblJswCommunications.findAll({
      where: { to: phone },
      order: [["timestamp", "DESC"]],
    });
  }
};
