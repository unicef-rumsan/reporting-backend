const { AbstractController } = require("@rumsan/core/abstract");
const checkToken = require("../../helpers/utils/checkToken");
const { finderByProjectId } = require("../../helpers/utils/projectFinder");
const { CommunicationsModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super((options = {}));
    options.listeners = {};
    this.table = CommunicationsModel;
  }

  registrations = {
    add: (req) => this.add(req.payload, req),
    list: (req) => this.list(req.query, req.headers.projectId),
    getById: (req) => this.getById(req.params.id, req),
    bulkAdd: (req) => this.bulkAdd(req.payload, req),
    update: (req) => this.update(req.params.sid, req.payload, req),
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
    try {
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
    list = JSON.parse(JSON.stringify(list));
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
};
