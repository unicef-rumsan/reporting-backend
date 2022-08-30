const { UserController } = require("@rumsan/user");
const Settings = require("../../helpers/settings");

module.exports = class extends UserController {
  constructor(options) {
    super(options);
    this.registerControllers({
      test: (req) => this.test(req),
    });
  }

  // registrations = {
  //   ...this.registrations,
  //   ...{ test: (req) => this.test(req) },
  // };

  test() {
    this.emit("test-triggered", { xxx: 1 });
    return Settings.SMS();
  }
};
