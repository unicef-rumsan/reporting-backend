const { scripts, sourceApi } = require("./_common");
const { ethers } = require("ethers");

const scr = {
  async getVendors() {
    const { data } = await sourceApi.get("/reports/vendors");
    return data.map((el) => el.wallet_address);
  },

  async bulkBalance(vendors) {
    const abi = await scripts.getAbi("Rahat");
    const callData = vendors.map((vendorId) =>
      scripts.generateMultiCallData(abi, "vendorBalance", [vendorId])
    );
    return scripts.multicall.call(callData);
  },

  async getVendorBalance() {
    const vendors = await scr.getVendors();
    const balance = await scr.bulkBalance(vendors);
    const rahatInterface = await scripts.interface("Rahat");
    const decodedData = balance.map((vendorId) =>
      rahatInterface.decodeFunctionResult("vendorBalance", vendorId)
    );
    const balances = decodedData.map((el, i) => {
      return {
        vendor: vendors[i],
        cashAllowance: el.cashAllowance.toNumber(),
        tokenBalance: el.tokenBalance.toNumber(),
        cashBalance: el.cashBalance.toNumber(),
      };
    });
    return balances;
  },
};

(async () => {
  await scr.getVendorBalance();
})();
