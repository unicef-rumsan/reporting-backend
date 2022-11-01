require("../modules/services");
const config = require("config");

const { username, password, dbTest } = config.get("db");
const SequelizeDB = require("@rumsan/core").SequelizeDB;
SequelizeDB.init(dbTest, username, password, config.get("db"));
const { db } = SequelizeDB;
require("../modules/models");

const dropTables = `
DROP TABLE IF EXISTS "tblAppSettings";
DROP TABLE IF EXISTS "tblBeneficiaries";
DROP TABLE IF EXISTS "tblCache_ClaimAcquiredERC20";
DROP TABLE IF EXISTS "tblProjects";
DROP TABLE IF EXISTS "tblTxs";
DROP TABLE IF EXISTS "tblVendors";
`;

beforeAll(async () => {
  await db.authenticate();
  console.log("Database connected...");
  await db.query(dropTables);
  await db.sync();
  console.log("DB Setup Complete");
});

afterAll(async () => {
  await db.connectionManager.pool.destroy();
});

module.exports = {
  db,
};
