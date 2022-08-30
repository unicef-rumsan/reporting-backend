const config = require("config");
const ethers = require("ethers");
const axios = require("axios");

const rahatServer = config.get("services.rahat");
const websocketProvider = config.get("services.blockchain.webSocketProvider");

const provider = new ethers.providers.WebSocketProvider(websocketProvider);

module.exports = {
  /**
   * Get contract information from Rahat server
   */
  async getContract() {
    let res = await axios(`${rahatServer}/api/v1/app/contracts/Rahat`);
    const { abi } = res.data;
    res = await axios(`${rahatServer}/api/v1/app/settings`);
    const contractAddress = res.data.agency.contracts.rahat;
    return new ethers.Contract(contractAddress, abi, provider);
  },

  /**
   * Create SHA3 hash of OTP.
   * @param {string} payload data to create hash
   */
  generateHash(payload) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));
  },
  /**
   * Listen to blockchain events
   */
  async listen() {
    const contract = await this.getContract();
    contract.on("ClaimAcquiredERC20", async (vendor, phone, amount, log) => {
      try {
        console.log({
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          vendor,
          phone: phone.toNumber(),
          amount: amount.toNumber(),
        });
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
    console.log(`Coontract: ${contract.address}`);
    console.log("> Listening to events...");
    console.log("----------------------------------------");
  },
};
