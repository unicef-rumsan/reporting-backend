const config = require("config");

const urlConfig = {
  serverUrl: "https://unicef-api.xa.rahat.io/api/v1",
  explorerUrl: "https://explorer.rumsan.com/api",
  updatedExplorerUrl: "https://explorer.esatya.io",
  reportingUrl: "http://localhost:4900/api/v1",
};
const axios = require("axios");
const ethers = require("ethers");

const START_BLOCK = 16320000;

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
    console.log(
      `> Getting Transactions from explorer "${urlConfig.explorerUrl}"...`
    );
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

        const data = {
          blockNumber: d.blockNumber,
          txHash: d.transactionHash,
          timestamp: parseInt(d.timeStamp),
          vendor: log.args.vendor,
          // phone: log.args[1]?.toNumber(),
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
    console.log("----------------------------------------");
    console.log(
      `> Getting Transactions from "${urlConfig.updatedExplorerUrl}"...`
    );
    console.log("----------------------------------------");
    // const { rahat: rahatContractAddress } = await this.getAddresses();
    // console.log("rahatContractAddress", rahatContractAddress);
    let rahatContractAddress = "0x67749B69cc2e5b146fd140A21f9De2Ac61d8d47F";

    try {
      const { data } = await axios.get(
        `${urlConfig.updatedExplorerUrl}/api?module=logs&action=getLogs&fromBlock=16320000&toBlock=latest&address=0x67749B69cc2e5b146fd140A21f9De2Ac61d8d47F&topic0=ClaimAcquiredERC20(address,uint256,uint256)`
      );
      // const { data } = await axios.get(
      //   `${urlConfig.updatedExplorerUrl}/api?module=logs&action=getLogs&fromBlock=${START_BLOCK}&toBlock=latest&address=${rahatContractAddress}&topic0=ClaimAcquiredERC20(address,uint256,uint256)`
      // );

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
      console.log("Success:", savedBulk.data);
      return mappedData;
    } catch (error) {
      console.log(error);
    }
  },

  async getModifiedTransactionLogs() {
    console.log("----------------------------------------");
    console.log(
      `> Getting Transactions from "${urlConfig.updatedExplorerUrl}"...`
    );
    console.log("----------------------------------------");
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

      const mappedData = txData.map((tx) => {
        const log = logData.find((d) => d.txHash === tx.txHash);

        return {
          id: tx?.id,
          txHash: tx.txHash,
          beneficiary: tx.beneficiary,
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
          isClaimed: log.extras?.isClaimed,
          // isOnline: log.extras?.isOnline,
          tokenIssued: log.extras?.tokenIssued,
          // tokenBalance: log.extras?.tokenBalance,
        };
      });

      return mappedData;
    } catch (err) {
      console.log("err", err);
    }
  },
  async updateMissingTransactionValue() {
    try {
      const trasactionsWithMissingValues =
        await this.getModifiedTransactionLogs();

      console.log("----------------------------------------");
      console.log(
        `Found ${trasactionsWithMissingValues.length} missing transactions. 

      Trying to update...`
      );
      console.log("----------------------------------------");

      for (missingTransaction of trasactionsWithMissingValues) {
        const { id, txHash, ...transaction } = missingTransaction;

        await axios.patch(
          `${urlConfig.reportingUrl}/claimAcquiredERC20Transactions/update/${txHash}`,
          transaction
        );
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Updating beneficiary info");
        await axios.patch(
          `${urlConfig.reportingUrl}/beneficiaries/updateExplorerTokenInfo/${transaction.beneficiary}`,
          {
            tokenBalance: transaction.tokenBalance,
            tokenIssued: transaction.tokenIssued,
            isOnline: transaction.isOnline,
          }
        );

        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // console.log("Updating token issue model");

        await axios.post(`${urlConfig.reportingUrl}/issued-tokens/add`, {
          issuerPhone: transaction.beneficiary,
          date: transaction.timestamp,
          claimedAmount: transaction.amount,
        });
      }
      console.log(`Missing values for transactions updated`);
      console.log("----------------------------------------");
    } catch (error) {
      console.error(`Error updating missing values for transactions`);
      console.log("----------------------------------------");
      console.log("error", error?.response?.data.message);
    }
  },
};

(async () => {
  await scripts.getLogsFromExplorer();
  await scripts.getModifiedDecodedLogs();
  await scripts.updateMissingTransactionValue();
})();
