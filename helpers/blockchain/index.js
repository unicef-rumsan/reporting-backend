const chainUrl = `https://polygon-mumbai.infura.io/v3/e866c3bc55d6437b869439769136218f`;
const Web3 = require('web3');


const web3Provider = new Web3(new Web3.providers.HttpProvider(chainUrl));

module.exports ={
    web3Provider
}