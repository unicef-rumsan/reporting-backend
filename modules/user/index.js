const { UserRouter, RSU_EVENTS } = require("@rumsan/user");
const Controller = require("./user.controller");
const EventHandlers = require("../eventHandlers");

module.exports = class extends UserRouter {
  constructor() {
    const options = {
      listeners: {
        "login-success": (a) => {
          console.log("Login success", a);
        },
        [RSU_EVENTS.USER_ADD_OTP]: EventHandlers.mailOtp,
      },
      mixins: {
        setAccessTokenData: (data) => {
          return {
            user: {
              id: data.user.id,
              name: data.user.name,
              home_address: data.user.home_address,
            },
            permissions: data.permissions,
          };
        },
      },
    };

    super({
      controller: new Controller(options),
    });
    this.addRoutes({
      test: {
        method: "GET",
        path: "/test",
        description: "Add new Tag",
      },
    });
  }
};
