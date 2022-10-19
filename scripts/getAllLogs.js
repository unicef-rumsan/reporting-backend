const config = require("config");

const urlConfig = {
  serverUrl: "https://unicef-api.xa.rahat.io/api/v1",
  explorerUrl: "https://explorer.rumsan.com/api",
  updatedExplorerUrl: "https://explorer.esatya.io",
  reportingUrl: "http://localhost:4900/api/v1",
};
const axios = require("axios");
const ethers = require("ethers");

const START_BLOCK = 16112707;

const scripts = {
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

  async getLogsFromExplorer() {
    console.log("----------------------------------------");
    console.log("> Getting Transactions from explorer...");
    console.log("----------------------------------------");

    let abi = await this.getAbi("Rahat");
    try {
      let { data } = await axios.get(
        `${urlConfig.explorerUrl}?module=logs&action=getLogs&fromBlock=16112707&toBlock=latest&address=0x67749B69cc2e5b146fd140A21f9De2Ac61d8d47F&topic0=0xe4de809bf00bba73c562150b76ba81e5af05183458342bfdb09a7c9e303813e5`
      );
      const iface = new ethers.utils.Interface(abi);

      const logData = data.result.map((d) => {
        const topics = d.topics.filter((d) => d !== null);
        let log = iface.parseLog({
          data: d.data,
          topics,
        });
        console.log(
          "first",
          d.timeStamp,
          String(new Date(parseInt(d.timeStamp) * 1000))
        );
        const data = {
          blockNumber: d.blockNumber,
          txHash: d.transactionHash,
          timestamp: new Date(parseInt(d.timeStamp) * 1000),
          vendor: log.args.vendor,
          phone: log.args[1]?.toNumber(),
          amount: log.args.amount?.toNumber(),
          beneficiary: log.args.beneficiary.toNumber(), //test
        };

        return data;
      });
      // const savedBulk = await ClaimERCTransCache.createBulk(logData);
      const savedBulk = await axios.post(
        `${urlConfig.reportingUrl}/claimAcquiredERC20Transactions/add/bulk`,
        logData
      );
      console.log("Done:", savedBulk.data.data);
      return logData;
    } catch (err) {
      console.log("err", err);
    }
    // console.log("logData", logData);
    // this.emit(EVENTS.TRANSACTION_ADDED_EXPLORER_BULK, logData);
  },

  async getDataFromLogs() {
    let rahatContract = await this.getRahatContract();
    let provider = await this.getProvider();

    const filterTokenReceived = rahatContract.filters.ClaimAcquiredERC20();
    filterTokenReceived.fromBlock = 16320000;
    filterTokenReceived.toBlock = "latest";
    const logs = await provider.getLogs(filterTokenReceived);
    console.log(logs);
  },

  async getModifiedDecodedLogs() {
    const rahatContractAddress = await this.getAddresses().rahat;

    try {
      const { data } = await axios.get(
        `${urlConfig.updatedExplorerUrl}?module=logs&action=getLogs&fromBlock=${START_BLOCK}&toBlock=latest&address=${rahatContractAddress}&topic0=0xe4de809bf00bba73c562150b76ba81e5af05183458342bfdb09a7c9e303813e5`
      );

      const mappedData = data?.result.map((log) => {
        const decoded = log.decoded.eventFragment.inputs
          .map((input, index) => ({
            key: input.name,
            value:
              typeof log.decoded.args[index] === "object"
                ? parseInt(log.decoded.args[index]?.hex, 16)
                : log.decoded.args[index],
          }))
          .reduce(
            (obj, item) => Object.assign(obj, { [item.key]: item.value }),
            {}
          );

        return {
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          timestamp: new Date(parseInt(log.timeStamp) * 1000),
          ...decoded,
        };
      });
      const savedBulk = await axios.post(
        `${urlConfig.reportingUrl}/claimAcquiredERC20Transactions/add/bulk`,
        mappedData
      );
      console.log("Done:", savedBulk.data.data);
      // return mappedData;
    } catch (error) {
      console.log(error);
    }
  },

  async getModifiedTransactionLogs() {
    try {
      const { data: logData } = await axios.get(
        `${urlConfig.updatedExplorerUrl}/transactions`
      );
      const txHashes = logData.map((d) => d.txHash);

      const {
        data: { data: txData },
      } = await axios.post(
        `${urlConfig.reportingUrl}/claimAcquiredERC20Transactions/listByTxHashes`,
        { txHashes }
      );

      const mappedData = logData?.map((log) => {
        const fetchedFromDB = txData.filter((d) => d.txHash === log.txHash)[0];
        return {
          id: fetchedFromDB?.id,
          txHash: log.txHash,
          method: log.extras
            ? log.extras?.isPhone
              ? "sms"
              : "qr"
            : "unavailable",
          mode: log.extras
            ? log.extras?.isOffline
              ? "offline"
              : "online"
            : "unavailable",
          ward: log.extras ? log.extras?.ward : 0,
        };
      });
      return mappedData;
    } catch (err) {
      console.log("err", err);
    }
  },
  async updateMissingTransactionValue() {
    const trasactionsWithMissingValues =
      await this.getModifiedTransactionLogs();

    for (missingTransaction of trasactionsWithMissingValues) {
      const { id, txHash, ...transaction } = missingTransaction;
      try {
        await axios.patch(
          `${urlConfig.reportingUrl}/claimAcquiredERC20Transactions/update/${txHash}`,
          transaction
        );
      } catch (error) {
        console.log("error", error);
      }
    }
    console.log(`Missing values for transactions updated`);
    return "done";
  },
};

(async () => {
  await scripts.getLogsFromExplorer();
  // await scripts.getModifiedDecodedLogs();
  await scripts.updateMissingTransactionValue();
})();
