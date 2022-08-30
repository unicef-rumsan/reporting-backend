require("./services");
const WSService = require("@rumsan/core/services/webSocket");
const { AppSettings } = require("@rumsan/core");

//const Tag = require("./tag");
const { mailOtp } = require("./eventHandlers");

let Routes = {
  //Tag: new Tag(),
 
  AppSettings: AppSettings.Router(),
};

module.exports = Routes;
