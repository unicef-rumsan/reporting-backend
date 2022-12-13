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
    const projects = await scr.getProjects();
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
};

(async () => {
  await scr.getProjectBalance();
})();
