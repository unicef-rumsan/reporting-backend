const { ethers } = require("ethers");
const { scripts, sourceApi, reportApi } = require("./_common");

const scr = {
  async getProjects() {
    const { data } = await sourceApi.get("/reports/projects");
    return data.map((el) => el._id);
  },

  async bulkBalance(projects) {
    const abi = await scripts.getAbi("Rahat");
    const callData = projects.map((projId) =>
      scripts.generateMultiCallData(abi, "remainingProjectErc20Balances", [
        ethers.utils.id(projId),
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
      rahatInterface.decodeFunctionResult(
        "remainingProjectErc20Balances",
        projId
      )
    );
    const balances = decodedData.map((el, i) => {
      return {
        project: projects[i],
        balance: el[0].toNumber(),
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
