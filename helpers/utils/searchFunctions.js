const { where, col, fn } = require("sequelize");

const searchObjectKeys = (object) => {
  let searchQuery = {};

  for (const key in object) {
    if (
      typeof object[key] === "string" &&
      object[key] !== "false" &&
      object[key] !== "true"
    ) {
      searchQuery[key] = where(
        fn("LOWER", col(key)),
        "LIKE",
        "%" + object[key] + "%"
      );
    } else if (object[key] === "false" || object[key] === "true") {
      searchQuery[key] = object[key] === "false" ? false : true;
    } else {
      searchQuery[key] = object[key];
    }
  }
  return searchQuery;
};

module.exports = {
  searchObjectKeys,
};
