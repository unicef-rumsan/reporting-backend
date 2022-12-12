const { reportApi, scripts, sourceApi } = require("./_common");

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

const scripts = {
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
};

(async () => {
  await scripts.migrateVendors();
})();
