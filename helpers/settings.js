const { AppSettings } = require("@rumsan/core");
const config = require("config");

module.exports = {
  SMS: () => {
    return AppSettings.get("sms_api"); //config.get("sms_api");
  },
};
