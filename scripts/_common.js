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

  async getRahatContract(wallet) {
    const abi = await this.getAbi("Rahat");
    const { contracts, networkUrl } = await this.getSettings();
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);
    if (!wallet) return new ethers.Contract(contracts.rahat, abi, provider);
    return new ethers.Contract(contracts.rahat, abi, wallet);
  },
};

module.exports = {
  scripts: contractScripts,
  urlConfig,
  sourceApi,
  reportApi,
};
