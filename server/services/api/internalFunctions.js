const axios = require('axios');
const { getIp } = require('../helpers');
const { cleanupTransferReturn, cleanupTransactionDetails } = require('../filters/solScanFilters');
const { cleanupTransactionDetailsAlchemy } = require('../filters/alchemyFilters');
const { cleanupNFTData } = require('../filters/meFilters');

const magicEdenBase = "https://api-mainnet.magiceden.dev/v2";
const solScanBase = 'https://api.solscan.io';
const solScanPublicBase = 'https://public-api.solscan.io';
const alchemyPrivateBase = `https://solana-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`;



// returns NFTs in wallet given a limit and offet. Max limit is 500
const getWalletNFTs = async (address, limit, offset) => {
  const ip = getIp();
  axios.defaults.headers.common['CLIENT_IP'] = ip;
  let NFTcollectedURL = `${magicEdenBase}/wallets/${address}/tokens?limit=${limit}&offset=${offset}`;
  let NFTcollected = await axios.get(NFTcollectedURL).then(res => {
    return res.data
  }).catch(err => {
    console.log(err)
    throw 'Could not get NFTs in wallet'
  });
  return NFTcollected;
}

// returns the transactions of an NFT based on the limit and offset
const getTransactions = async (tokenMintAddress, limit, offset) => {
  let dataURL = `${solScanBase}/transfer/token?token_address=${tokenMintAddress}&limit=${limit}&offset=${offset}`;
  let transactions = await axios.get(dataURL).then(res => {
    return cleanupTransferReturn(res.data?.data?.items);
  }).catch(err => {
    console.log(err)
    throw 'Could not get NFTs in wallet'
  });
  return transactions;
}

const getTransactionDetailsAlchemy = async (txHash) => {
  const transactionDetails = await axios.post(alchemyPrivateBase, {
    id: 1,
    jsonrpc: "2.0",
    method: "getTransaction",
    params: [txHash, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
  }).then(res => {
    return cleanupTransactionDetailsAlchemy({txHash, ...res.data})
  }).catch(err => {
    console.log(err)
    throw 'Could not get transaction details'
  });
  return transactionDetails;
}

// gets transaction details given a transaction hash
const getTransactionDetails = async (txHash) => {
  const txURL = `${solScanPublicBase}/transaction/${txHash}`;
  const transactionDetails = await axios.get(txURL).then(res => {
    return cleanupTransactionDetails(res.data)
  }).catch(err => {
    console.log(err)
    throw 'Could not get transaction details'
  });
  return transactionDetails;
}



// gets previous transfers on a nft given a limit and offset.
const getPreviousTransfersForWallet = async (tokenMintAddress, limit, offset) => {
  let dataURL = `${solScanBase}/transfer/token?token_address=${tokenMintAddress}&limit=${limit}&offset=${offset}`;
  let transfers = await axios.get(dataURL).then(res => {
    return cleanupTransferReturn(res.data?.data?.items);
  }).catch(err => {
    console.log(err)
    throw 'Could not get NFTs in wallet'
  });
  return transfers;
}

// gets a singular listing from a collection, given a collection symbol
const getCollectionListing = async (collectionSymbol) => {
  const listingDataURL = `${magicEdenBase}/collections/${collectionSymbol}/listings?limit=1`;
  const listing = await axios.get(listingDataURL).then(res => res.data[0]).catch(err => {
    console.log(err)
    throw 'Could not fetch listing data'
  });
  return listing;
}

// gets the metadata of a singlar nft given the mint address
const getNftMetadata = async (tokenMintAddress) => {
  const nftDataURL = `${magicEdenBase}/tokens/${tokenMintAddress}`;
  const nftData = await axios.get(nftDataURL).then(res => cleanupNFTData(res.data)).catch(err => {
    console.log(err)
    throw 'Could not fetch nft data'
  });
  return nftData;
}



module.exports = {
  getWalletNFTs,
  getTransactions,
  getTransactionDetails,
  getPreviousTransfersForWallet,
  getCollectionListing,
  getNftMetadata,
  getTransactionDetailsAlchemy
}