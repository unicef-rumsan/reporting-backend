const config = require("config");

const mailConfig = require("../config/mail.json");
const { MailService } = require("@rumsan/core/services");
const { RSConfig } = require("@rumsan/core");

MailService.setConfig(mailConfig);
RSConfig.set(config.get("app"));
