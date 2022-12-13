const { scripts, sourceApi, reportApi } = require("./_common");

const scr = {
  async bulkBalance(beneficiaries) {
    const abi = await scripts.getAbi("Rahat");
    const callData = beneficiaries.map((ben) =>
      scripts.generateMultiCallData(abi, "beneficiaryBalance", [ben])
    );
    return scripts.multicall.call(callData);
  },

  async projectBeneficiaries(params) {
    console.log("Getting Beneficiaries");

    const { data } = await sourceApi.get("/reports/beneficiaries", {
      params,
    });
    return { phones: data.map((el) => Number(el.phone)) };
  },

  async getBeneficiaryBalance() {
    let { phones } = await scr.projectBeneficiaries();
    phones = phones.slice(0, 10);
    const balance = await scr.bulkBalance(phones);
    const rahatInterface = await scripts.interface("Rahat");
    const decodedData = balance.map((phones) =>
      rahatInterface.decodeFunctionResult("beneficiaryBalance", phones)
    );
    const balances = decodedData.map((el, i) => {
      return {
        beneficiary: phones[i],
        cashBalance: el.cashBalance.toNumber(),
        tokenBalance: el.tokenBalance.toNumber(),
        walletAddress: el.walletAddress,
        hasBankAccount: el.hasBankAccount,
        totalTokenIssued: el.totalTokenIssued.toNumber(),
      };
    });
    return balances;
  },

  async updateBeneficiaryBalance() {
    try {
      const balances = await scr.getBeneficiaryBalance();
      console.log("Updating Project Balances");

      for (let balance of balances) {
        await reportApi.patch(
          `/beneficiaries/updateTokenInfo/${balance.beneficiary}`,
          balance
        );
      }

      // const { data } = await reportApi.post(
      //   "/reports/beneficiary-balance",
      //   balances
      // );
      // return data;
    } catch (error) {
      console.log("error", error);
    }
  },
};

(async () => {
  await scr.updateBeneficiaryBalance();
})();
