const { AbstractController } = require("@rumsan/core/abstract");
const { TagModel } = require("../models");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    this.tblTags = TagModel;
  }

  registrations = {
    add: (req) => this.add(req),
    list: (req) => this.list(),
  };

  async add(req) {
    let { payload } = req;
    let newTag = new this.tblTags(payload);
    newTag = await newTag.save();
    newTag = JSON.stringify(newTag);
    newTag = JSON.parse(newTag);
    this.emit("tag-added", newTag);
    return newTag;
  }

  async list() {
    return this.tblTags.findAll();
  }
};
