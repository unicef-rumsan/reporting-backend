const ethers = require('ethers');
const config = require('config');

const network = config.get('binance.httpProvider');
const provider = new ethers.providers.JsonRpcProvider(network);
const {
   privateKey,mnemonic
} = require('../../config/privateKey.json');

const getSigner = pk => {
  let wallet
  if (!pk) wallet = new  ethers.Wallet.fromMnemonic(mnemonic)
    // pk = privateKey;
  if(pk) wallet = new ethers.Wallet(pk);
  const signer = wallet.connect(provider);
  return signer;
};



module.exports = {
  getSigner
};
