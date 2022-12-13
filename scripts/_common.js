const axios = require("axios");
const ethers = require("ethers");
const config = require("config");

const urlConfig = {
  serverUrl: "https://unicef-api.xa.rahat.io/api/v1",
  explorerUrl: "https://explorer.rumsan.com/api",
  updatedExplorerUrl: "https://explorer.esatya.io",
  reportingUrl: "http://localhost:4900/api/v1",
};

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

const contractScripts = {
  async getAddresses() {
    const res = await axios.get(`${urlConfig.serverUrl}/app/settings`);
    const {
      agency: { contracts },
    } = res.data;
    return contracts;
  },

  async getSettings() {
    const {
      data: {
        agency: { contracts },
        networkUrl,
      },
    } = await axios.get(`${urlConfig.serverUrl}/app/settings`);
    return { contracts, networkUrl };
  },

  async getAbi(contractName) {
    const {
      data: { abi },
    } = await axios.get(`${urlConfig.serverUrl}/app/contracts/${contractName}`);
    return abi;
  },

  async getProvider() {
    const { networkUrl } = await this.getSettings();
    return new ethers.providers.JsonRpcProvider(networkUrl);
  },

  async getAdminWallet() {
    const { networkUrl } = await this.getSettings();
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);
    return new ethers.Wallet(admin_pk, provider);
  },

  async getRahatContract(wallet) {
    const abi = await this.getAbi("Rahat");
    const { contracts, networkUrl } = await this.getSettings();
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);
    if (!wallet) return new ethers.Contract(contracts.rahat, abi, provider);
    return new ethers.Contract(contracts.rahat, abi, wallet);
  },

  generateMultiCallData(abi, functionName, params) {
    const iface = new ethers.utils.Interface(abi);
    return iface.encodeFunctionData(functionName, params);
  },

  multicall: {
    // async send(callData) {
    //   const wallet = await contractScripts.getAdminWallet();
    //   const rahatContract = await contractScripts.getRahatContract(wallet);
    //   console.log("++++Sending Transaction++++");
    //   estimatedGas = await rahatContract.estimateGas.multicall(callData);
    //   const gasLimit = estimatedGas.toNumber() + 10000;
    //   if (estimatedGas.toNumber() > networkGasLimit)
    //     throw new Error("Gas Usage too high! Transaction will fail");
    //   const tx = await rahatContract.multicall(callData, { gasLimit });
    //   const receipt = await tx.wait();
    //   console.log({ receipt });
    //   if (receipt.status) console.log("++++Transaction Success++++");
    //   else console.log("++++Transaction Failed++++");
    // },
    async call(callData) {
      const rahatContract = await contractScripts.getRahatContract();
      console.log("++++Calling Contract++++");
      return rahatContract.callStatic.multicall(callData);
    },
  },

  async interface(contractName) {
    const abi = await this.getAbi(contractName);
    return new ethers.utils.Interface(abi);
  },
};

module.exports = {
  scripts: contractScripts,
  urlConfig,
  sourceApi,
  reportApi,
};
