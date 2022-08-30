const verifyCaptcha = require("../helpers/utils/captcha");
const Package = require("../package.json");

const CaptchaPlugin = {
  name: "captcha-route-plugin",
  version: Package.version,
  register: (server) => {
    const BASE_URL = "/api/v1";
    const routePath = `${BASE_URL}/verifyCaptcha`;

    function registerCaptchaRoutes() {
      server.route({
        method: "POST",
        path: routePath,
        handler: function (request, h) {
          const captchaToken = request?.headers["h-captcha-response"] || null;
          return verifyCaptcha(captchaToken);
        },
      });
    }
    registerCaptchaRoutes();
  },
};

module.exports = CaptchaPlugin;
