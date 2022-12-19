const axios = require("axios");

// require("../modules/services");
const config = require("config");

// const { username, password, database } = config.get("db");
// const SequelizeDB = require("@rumsan/core").SequelizeDB;
// SequelizeDB.init(database, username, password, config.get("db"));
// const { db } = SequelizeDB;
// require("../modules/models");

const {
  reportMigrationUrl: { sourceUrl, reportingUrl },
} = config;

const sourceApi = axios.create({
  baseURL: sourceUrl.url + "/api/v1",
  headers: {
    report_token: sourceUrl.token,
  },
});

const reportApi = axios.create({
  baseURL: reportingUrl.url + "/api/v1",
  headers: {
    report_token: reportingUrl.token,
  },
});

const beneficiariesMapping = (list) => {
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    gender: item.gender,
    phone: item.phone,
    age: +item.extras?.age,
    child: +item.extras?.child,
    group: item.extras?.group,
    numOfAdults: +item.extras?.adult,
    numOfChildren: +item.extras?.child,
    walletAddress: item.wallet_address,
    projects: item.projects,
    agency: item.agency,
    ward: item.extras?.ward,
    familySize: +item.extras?.family_size,
    below5Count: +item.extras?.below5_count,
    below5Male: +item.extras?.below5_male,
    below5Female: +item.extras?.below5_female,
    below5_other: +item.extras?.below5_other,
    readSms: item.extras?.read_sms,
    hasPhone: item.extras?.phone_has,
    hasBank: item.extras?.bank_has,
    noLand: item.extras?.no_land,
    bank_withdraw: item.extras?.bank_withdraw,
    dailyWage: item.extras?.daily_wage,
    disability: item.extras?.disability,
    consentPicture: item.extras?.consent_picture,
    bankAccountNumber: item?.extras?.bank_account,
    mobilizer: item?.extras?.mobilizer,
  }));
};

const vendorsMapping = (list) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    gender: item.gender,
    phone: item.phone,
    walletAddress: item.wallet_address,
    govtId: item.govt_id,
    agencies: item.agencies,
    projects: item.projects,
  }));

const projectsMapping = (list) =>
  list.map((item) => {
    return {
      id: item.id,
      name: item.name,
      projectManager: item.project_manager,
      location: item.location,
      status: item.status,
      // allocations: item.allocations,
      aidConnectActive: item.aid_connect.isActive,
      financialInstitutions: item.financial_institutions,
    };
  });

// const dropTables = `
//   DROP TABLE IF EXISTS "tblTxs";
//   DROP TABLE IF EXISTS "tblBeneficiaries";
//   DROP TABLE IF EXISTS "tblVendors";
//   DROP TABLE IF EXISTS "tblProjects";
// `;

const script = {
  async migrateBeneficiary() {
    console.log("Fetching Beneficaries");
    try {
      const beneficiaries = await sourceApi.get("/reports/beneficiaries");
      const beneficiaryData = beneficiariesMapping(beneficiaries.data);

      await reportApi.post("/beneficiaries/bulk", beneficiaryData);

      console.log("Beneficiaries bulk created");
    } catch (err) {
      console.error("Beneficiary Error: ", err?.response?.data);
    }
  },
  async migrateVendors() {
    console.log("Fetching Vendors");

    try {
      const vendors = await sourceApi.get("/reports/vendors");

      const vendorData = vendorsMapping(vendors.data);
      await reportApi.post("/vendors/bulk", vendorData);

      console.log("Vendors bulk created");
    } catch (err) {
      console.log("Vendor: ", err?.response?.data);
    }
  },
  async migrateProjects() {
    console.log("Fetching Projects");

    try {
      const projects = await sourceApi.get("/reports/projects");

      const projectData = projectsMapping(projects.data);

      await reportApi.post("/projects/bulk", projectData);

      console.log("Project bulk created");
    } catch (err) {
      console.log("Project: ", err?.response?.data);
    }
  },
};

(async () => {
  try {
    console.log("Fetching Data from Source...");
    await script.migrateBeneficiary();
    await script.migrateVendors();
    await script.migrateProjects();
    console.log("Data Migration Completed");
    process.exit(0);
  } catch (err) {
    console.log("Data Migration Failed");
    console.log(err);
    process.exit(1);
  }
})();
