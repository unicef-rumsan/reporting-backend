require("@rumsan/user").initModels();
const UserModel = require("./user/user.model");
const TagModel = require("./tag/tag.model");

let modelFactory = {
  TagModel: new TagModel().init(),
  UserModel: new UserModel().init(),
};

/**********************************************************
 * All the table associations belong here
 **********************************************************/

module.exports = modelFactory;
