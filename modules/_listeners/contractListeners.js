const conf = require("config");
const config = {
  serverUrl: "https://unicef-api.np.rahat.io/api/v1",
  explorerUrl: "",
};
const ethers = require("ethers");
const axios = require("axios");
const rahatServer = conf.get("services.rahat");
const websocketProvider = conf.get("services.blockchain.webSocketProvider");

var EventEmitter = require("events");
const { EVENTS } = require("../../constants/appConstants");

const provider = new ethers.providers.WebSocketProvider(websocketProvider);

class ContractListener extends EventEmitter {
  async getSettings() {
    const {
      data: {
        agency: { contracts },
        networkUrl,
      },
    } = await axios.get(`${config.serverUrl}/app/settings`);
    return { contracts, networkUrl };
  }
  async getAbi(contractName) {
    const {
      data: { abi },
    } = await axios.get(`${config.serverUrl}/app/contracts/${contractName}`);
    return abi;
  }

  async getProvider() {
    const { networkUrl } = await this.getSettings();
    return new ethers.providers.JsonRpcProvider(networkUrl);
  }

  async getRahatContract(wallet) {
    const abi = await this.getAbi("Rahat");
    const { contracts, networkUrl } = await this.getSettings();
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);
    if (!wallet) return new ethers.Contract(contracts.rahat, abi, provider);
    return new ethers.Contract(contracts.rahat, abi, wallet);
  }

  async getLogsFromExplorer() {
    let abi = await this.getAbi("Rahat");
    let { data } = await axios.get(
      "https://explorer.rumsan.com/api?module=logs&action=getLogs&fromBlock=16112000&toBlock=latest&address=0x67749B69cc2e5b146fd140A21f9De2Ac61d8d47F&topic0=0xe4de809bf00bba73c562150b76ba81e5af05183458342bfdb09a7c9e303813e5"
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
        timestamp: new Date(parseInt(d.timeStamp) * 1000),
        vendor: log.args.vendor,
        phone: log.args[1]?.toNumber(),
        amount: log.args.amount?.toNumber(),
        ward: "1",
        mode: "online",
        method: "qr",
      };
      return data;
    });
    return logData;
  }

  async getDataFromLogs() {
    let rahatContract = await this.getRahatContract();
    let provider = await this.getProvider();

    const filterTokenReceived = rahatContract.filters.ClaimAcquiredERC20();
    filterTokenReceived.fromBlock = 16320000;
    filterTokenReceived.toBlock = "latest";
    const logs = await provider.getLogs(filterTokenReceived);
    console.log(logs);
  }

  /**
   * Get contract information from Rahat server
   */
  async getContract() {
    let res = await axios(`${rahatServer}/api/v1/app/contracts/Rahat`);
    const { abi } = res.data;
    res = await axios(`${rahatServer}/api/v1/app/settings`);
    const contractAddress = res.data.agency.contracts.rahat;
    return new ethers.Contract(contractAddress, abi, provider);
  }

  async getLogsFromChain() {
    let rahatContract = await this.getRahatContract();
    const events = await rahatContract.queryFilter(
      "ClaimAcquiredERC20",
      16322900,
      "latest"
    );
    events.forEach((d) => {
      //console.log(d);
      console.log(d.args.vendor);
      console.log(d.args.beneficiary?.toNumber());
      console.log(d.args.amount?.toNumber());
    });
    //console.log(events[0].args.vendor);
  }

  /**
   * Create SHA3 hash of OTP.
   * @param {string} payload data to create hash
   */
  generateHash(payload) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));
  }
  /**
   * Listen to blockchain events
   */
  async listen() {
    const contract = await this.getContract();
    contract.on("ClaimAcquiredERC20", async (vendor, phone, amount, log) => {
      try {
        const data = {
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          vendor,
          phone: phone.toNumber(),
          amount: amount.toNumber(),
        };

        this.emit(EVENTS.TRANSACTION_ADDED, data);
      } catch (e) {
        console.log(e);
      }
    });

    provider.on("pending", async (txHash) => {
      const tx = await provider.getTransaction(txHash);
      if (tx.to === "0x09CFf8A49BeB853D7F74b7A6D3d9aFe8B8749DB4") {
        const amount = ethers.utils.formatEther(tx.value);

        if (amount === "0.067") {
          console.log("===> SMS ping test");
        }
      }
    });

    console.log("----------------------------------------");
    console.log(`Contract: ${contract.address}`);
    console.log("> Listening to events...");
    console.log("----------------------------------------");
  }
}

module.exports = new ContractListener();
