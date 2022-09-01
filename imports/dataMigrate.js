const axios = require("axios");

require("../modules/services");
const config = require("config");

const { username, password, database } = config.get("db");
const SequelizeDB = require("@rumsan/core").SequelizeDB;
SequelizeDB.init(database, username, password, config.get("db"));
const { db } = SequelizeDB;
const { BeneficiaryModel } = require("../modules/models");

const api = axios.create({
  baseURL: "http://localhost:3601",
  headers: {
    report_token: "token",
  },
});

const beneficiariesMapping = (list) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    gender: item.gender,
    phone: item.phone,
    age: +item.extras.age,
    child: +item.extras.child,
    group: item.extras.group,
    wallet_address: item.wallet_address,
  }));

//   DROP TABLE IF EXISTS "tblTxs";
// DROP TABLE IF EXISTS "tblAppSettings";
const dropTables = `

  DROP TABLE IF EXISTS "tblBeneficiaries";
`;

const script = {
  async migrateBeneficiary() {
    try {
      const beneficiaries = await api.get("/api/v1/reports/beneficiaries");
      const beneficiaryData = beneficiariesMapping(beneficiaries.data);

      await BeneficiaryModel.bulkCreate(beneficiaryData);

      console.log("Beneficiaries bulk created");
    } catch (err) {
      console.log(err);
    }
  },
};

const run = async () => {
  db.authenticate()
    .then(async () => {
      console.log("Database connected...");
      await db.query(dropTables);
      await db.sync();
      await script.migrateBeneficiary();

      console.log("Done");
      process.exit(1);
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
};

run();
