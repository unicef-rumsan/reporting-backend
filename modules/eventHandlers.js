const { DataUtils } = require("@rumsan/core/utils");
const { MailService } = require("@rumsan/core/services");
const { EMAIL_TEMPLATES } = require("../constants/index");
const WSService = require("@rumsan/core/services/webSocket");

module.exports = {
  mailOtp(otp, to, user) {
    MailService.send({
      to,
      template: EMAIL_TEMPLATES.USER_ADDED,
      data: Object.assign(DataUtils.convertToJson(user), { otp }),
    });
  },
};
