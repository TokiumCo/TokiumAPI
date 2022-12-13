// returns all transactions on an NFT (excluding transfer and mint) from ME API (DEPRECATED)
const allTransactions = async (tokenMintAddress) => {
  let offset = 0;
  const limit = 100;
  let dataURL = `${magicEdenBase}/tokens/${tokenMintAddress}/activities?limit=${limit}&offset=${offset}`;
  let transactions = await axios.get(dataURL).then(res => res.data).catch(err => {
    console.log(err)
    throw 'Could not get NFTs in wallet'
  });

  let toReturn = transactions;
  let responseLength = transactions.length;

  while (responseLength === limit) {
    offset += limit;
    dataURL = `${magicEdenBase}/tokens/${tokenMintAddress}/activites?limit=${limit}&offset=${offset}`;
    transactions = await axios.get(dataURL).then(res => res.data).catch(err => {
      console.log(err)
      throw 'Could not get NFTs in wallet'
    });
    responseLength = transactions.length;
    toReturn = [...toReturn, ...transactions];
  }

  return toReturn;
};

// previous trnasactions of a nft. Optional {lastTxHash} to get transactions before this tx
const getPreviousTransactionsForWallet = async (tokenMintAddress, lastTxHash) => {
  let dataURL = `${solScanBase}/account/transaction?address=${tokenMintAddress}`;
  if (lastTxHash) dataURL += `&before=${lastTxHash}`;
  let transactions = await axios.get(dataURL).then(res => res.data).catch(err => {
    console.log(err)
    throw 'Could not get NFTs in wallet'
  });
  return transactions;
};