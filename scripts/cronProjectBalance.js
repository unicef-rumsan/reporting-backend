const { ethers } = require("ethers");
const { scripts, sourceApi, reportApi } = require("./_common");

const scr = {
  async getProjects() {
    const { data } = await sourceApi.get("/reports/projects");
    return data.map((el) => el._id);
  },

  async bulkBalance(projects) {
    const contracts = await scripts.getAddresses();
    const abi = await scripts.getAbi("Rahat");
    const callData = projects.map((projId) =>
      scripts.generateMultiCallData(abi, "projectBalance", [
        ethers.utils.id(projId),
        contracts.rahat_admin,
      ])
    );
    return scripts.multicall.call(callData);
  },

  async getProjectBalance() {
    console.log("Getting Projects");
    const projects = await scr.getProjects();
    console.log("Getting Project Balances");
    const balance = await scr.bulkBalance(projects);
    const rahatInterface = await scripts.interface("Rahat");
    const decodedData = balance.map((projId) =>
      rahatInterface.decodeFunctionResult("projectBalance", projId)
    );
    const balances = decodedData.map((el, i) => {
      return {
        project: projects[i],
        balance: el[0].toNumber(),
        totalBudget: el.totalBudget.toNumber(),
        cashAllowance: el.cashAllowance.toNumber(),
        cashBalance: el.cashBalance.toNumber(),
        tokenBalance: el.tokenBalance.toNumber(),
      };
    });
    return balances;
  },

  async updateProjectBalance() {
    try {
      const balances = await scr.getProjectBalance();
      console.log("Updating Project Balances");

      for (const balance of balances) {
        await reportApi.patch(
          `/projects/updateTokenInfo/${balance.project}`,
          balance
        );
      }
    } catch (err) {
      console.log(err);
    }
  },
};

(async () => {
  await scr.updateProjectBalance();
})();
