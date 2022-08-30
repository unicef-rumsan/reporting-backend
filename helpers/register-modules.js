const app = require("../app");
const modules = require("../modules");

/**
 * Register all the feats.
 */
function registerModules() {
  Object.keys(modules).forEach((mdl) => {
    modules[mdl].register(app);
  });
}

module.exports = registerModules;
