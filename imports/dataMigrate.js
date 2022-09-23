const axios = require("axios");

require("../modules/services");
const config = require("config");

const { username, password, database } = config.get("db");
const SequelizeDB = require("@rumsan/core").SequelizeDB;
SequelizeDB.init(database, username, password, config.get("db"));
const { db } = SequelizeDB;
require("../modules/models");

const sourceApi = axios.create({
  baseURL: "http://localhost:3601/api/v1",
  headers: {
    report_token: "token",
  },
});

const reportApi = axios.create({
  baseURL: "http://localhost:4900/api/v1",
  headers: {
    report_token: "6E4(WdnI5ukyHDaqy-AKEZvT$7JDnrQG",
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
const vendorsMapping = (list) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    gender: item.gender,
    phone: item.phone,
    wallet_address: item.wallet_address,
    govt_id: item.govt_id,
    agencies: item.agencies,
  }));
const projectsMapping = (list) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    project_manager: item.project_manager,
    location: item.location,
    allocations: item.allocations,
    financial_institutions: item.financial_institutions,
  }));

//   DROP TABLE IF EXISTS "tblTxs";
// DROP TABLE IF EXISTS "tblAppSettings";
const dropTables = `
  DROP TABLE IF EXISTS "tblBeneficiaries";
  DROP TABLE IF EXISTS "tblVendors";
  DROP TABLE IF EXISTS "tblProjects";
`;

const script = {
  async migrateBeneficiary() {
    try {
      const beneficiaries = await sourceApi.get("/reports/beneficiaries");
      const beneficiaryData = beneficiariesMapping(beneficiaries.data);

      await reportApi.post("/beneficiaries/bulk", beneficiaryData);

      console.log("Beneficiaries bulk created");
    } catch (err) {
      console.log(err);
    }
  },
  async migrateVendors() {
    try {
      const vendors = await sourceApi.get("/reports/vendors");
      const vendorData = vendorsMapping(vendors.data);
      await reportApi.post("/vendors/bulk", vendorData);

      console.log("Vendors bulk created");
    } catch (err) {
      console.log(err);
    }
  },
  async migrateProjects() {
    try {
      const projects = await sourceApi.get("/reports/projects");
      const projectData = projectsMapping(projects.data);

      await reportApi.post("/projects/bulk", projectData);

      console.log("Project bulk created");
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
      await script.migrateVendors();
      await script.migrateProjects();

      console.log("Done");
      process.exit(1);
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
};

run();
