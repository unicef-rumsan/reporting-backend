const Controller = require("./misc.controller");
const { AbstractRouter } = require("@rumsan/core/abstract");

module.exports = class extends AbstractRouter {
  constructor(options = {}) {
    options.name = options.name || "misc";
    options.listeners = {};
    options.controller = new Controller(options);
    super(options);
  }
  routes = {
    add: {
      method: "POST",
      path: "/{name}",
      description: "Add new data",
    },
    getByName: {
      method: "GET",
      path: "/{name}",
      description: "Get data by id",
    },
  };
};
