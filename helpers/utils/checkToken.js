const config = require("config");

const checkToken = (req) => {
  const token = req.headers.report_token;
  if (!config.has("app.report_token"))
    throw new Error("report_token is not specified in configuration.");
  if (!token) throw new Error("Must send report_token in headers.");
  if (config.get("app.report_token") !== token)
    throw new Error("Invalid report_token sent.");
};

module.exports = checkToken;
