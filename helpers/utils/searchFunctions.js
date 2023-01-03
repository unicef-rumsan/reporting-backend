const { where, col, fn } = require("sequelize");

const searchObjectKeys = (object) => {
  let searchQuery = {};

  for (const key in object) {
    searchQuery[key] = where(
      fn("LOWER", col(key)),
      "LIKE",
      "%" + object[key] + "%"
    );
  }
  return searchQuery;
};

module.exports = {
  searchObjectKeys,
};
