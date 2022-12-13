/**
 * Functions:
 *  - getCollectionRoyalties
 *  - getTokensInWallet
 *  - getTokenTransactionHistory
 *  - getRoyaltiesPaid
 */

const { verifyPaidRoyalties, createGroups } = require('./helpers');
const { getWalletNFTs, getTransactions, getTransactionDetails, getPreviousTransfersForWallet, getCollectionListing, getNftMetadata, getTransactionDetailsAlchemy } = require('./api/internalFunctions');
const { getMagicEdenCollectionSymbol, hasNFT } = require('./filters/meFilters');
const { getBuyerPaidAlchemy, getCreatorPaymentsAlchemy } = require('./filters/alchemyFilters');

 
// returns the royalties on a collection in percent
const getCollectionRoyalties = async (data) => {
  const { collectionLink } = data;
  const collectionSymbol = getMagicEdenCollectionSymbol(collectionLink);
  const listing = await getCollectionListing(collectionSymbol);
  const nftData = await getNftMetadata(listing.tokenMint);

  const royalties = parseFloat((nftData.sellerFeeBasisPoints/100).toFixed(2))
  return {royaltiesPercent: royalties};
}


// returns if the wallet owns any NFT token from the provided NFT collection from first 100 NFTs checked
const isCollectionTokenInWallet = async (data) => {
  const { collectionLink, address, offset } = data;

  const limit = 100;
  let offsetAmount = offset || 0;
  let NFTcollected = await getWalletNFTs(address, limit, offsetAmount);
  const collectionSymbol = getMagicEdenCollectionSymbol(collectionLink);

  let foundNFTs = hasNFT(NFTcollected, collectionSymbol);
  let responseLength = NFTcollected.length;

  // if not found and there are more NFTs in wallet, loop through them
  while (responseLength === limit) {
    offsetAmount += limit;
    NFTcollected = await getWalletNFTs(address, limit, offsetAmount);
    responseLength = NFTcollected.length;
    const relevantNFT = hasNFT(NFTcollected, collectionSymbol)
    foundNFTs.push(...relevantNFT);
  }


  return foundNFTs;
}

const tokenAmountInWallet = async (data) => {
  const nfts = await isCollectionTokenInWallet(data);
  return {amount: nfts.length};
}




// returns 10 previous NFT transfers
const previousNftTransfers = async (data) => {
  const { tokenMintAddress, setLimit, all } = data;
  let offset = 0;
  const limit = setLimit || 10;
  let transactions = await getTransactions(tokenMintAddress, limit, offset);

  let toReturn = transactions;
  let responseLength = transactions.length;

  // by default we don't return all transfers on an NFT, only 10
  if (all) {
    while (!setLimit && responseLength === limit) {
      offset += limit;
      transactions = await getTransactions(tokenMintAddress, limit, offset);

      responseLength = transactions.length;
      toReturn = [...toReturn, ...transactions];
    }
  }
  
  return toReturn;
};


// last transfer which required a transfer between 2,3 parties
const lastTransfer = async (data) => {
  const { tokenMintAddress, excludeSelfTransfer } = data;
  let offset = 0;
  const limit = 10;

  const get23PartyTransfer = async (data) => {
    for (const transfer of data) {
      const transferTransacDetails = await getTransactionDetailsAlchemy(transfer.txHash);
      if (transferTransacDetails?.signatures?.length > 1) return toReturn = { transfer: transfer, transactionDetails: transferTransacDetails };
      else if (!excludeSelfTransfer && transfer.sourceTokenAccount === transfer.destTokenAccount) {
        return {transfer: transfer, transactionDetails: transferTransacDetails, toSelf: true}
      }
      
    }
    return null;

  }

  let transfers = await getPreviousTransfersForWallet(tokenMintAddress, limit, offset);
  let responseLength = transfers?.length;
  let found23Transfer = await get23PartyTransfer(transfers);

  while (responseLength > 0 && !found23Transfer && responseLength === limit) {
    offset += limit;
    transfers = await getPreviousTransfersForWallet(tokenMintAddress, limit, offset);
    responseLength = transfers.length;
    found23Transfer = await get23PartyTransfer(transfers);
  }

  if (!found23Transfer) found23Transfer = {transfer: null, transactionDetails: null}
  return found23Transfer;
}

const areCreatorsPaid = async (data) => {
  const { lastTransferData, nftCreators, royaltiesPercent } = data;

  if (!nftCreators || nftCreators.length === 0) return {royaltiesPaid: true, amountOwing: 0};

  // const transactionDetails = await getTransactionDetails(lastTransaction.txHash);
  let transactionDetails = lastTransferData.transactionDetails;

  // total royalties paid: solTransfer + unknownTransfers
  const { paid: totalAmountPaidToCreators } = getCreatorPaymentsAlchemy(transactionDetails, nftCreators);
  
  // if last transfer was a transfer to self, identify the last sale transfer made to buy
  if (lastTransferData.toSelf) {
    const prevSaleTransfer = await lastTransfer({ excludeSelfTransfer: true, tokenMintAddress: lastTransferData.transfer.tokenAddress })
    transactionDetails = prevSaleTransfer.transactionDetails;
  };

  // total amount paid to buy
  const amountPaidToBuy = getBuyerPaidAlchemy(transactionDetails);

  const percentRoyaltiesPaid = ((totalAmountPaidToCreators / amountPaidToBuy) * 100).toFixed(2);

  const verification = verifyPaidRoyalties(royaltiesPercent, percentRoyaltiesPaid, amountPaidToBuy)
  return verification;
};

const areRoyaltiesPaidOnNFt = async (nft) => {
  const lastTransferData = await lastTransfer({ tokenMintAddress: nft.mintAddress });
  const lastTransferDetails = lastTransferData.transfer;
  const lastTransactionData = lastTransferData.transactionDetails;

  if (!lastTransferData || !lastTransactionData || lastTransferDetails.type === 'mint' || lastTransferDetails.type === 'mintTo') {
    return {royaltiesPaid: true, amountOwing: 0}
  }
  else {
    // deosn't matter if it's a 2 party of a 3 party or a x party tranction, we check it
    const royalties = parseFloat((nft.sellerFeeBasisPoints / 100).toFixed(2));
    const verification = await areCreatorsPaid({ lastTransferData, royaltiesPercent: royalties, nftCreators: nft.creators});
    return verification;   
  }
}


// returns the last buy transaction based on address and collectionLink
const hasPaidRoyalties = async (data) => {
  // in this case, we're going through all NFTs. When creating function for all NFTs required to pay royalties, find one from collecion and done
  const ownedCollectionNFTS = await isCollectionTokenInWallet({ ...data, detailed: true });
  let paid = false;

  const groups = createGroups(ownedCollectionNFTS, 3);
  for (const group of groups) {
    const royaltiesPaidResult = await Promise.all(group.map(nft => areRoyaltiesPaidOnNFt(nft)));

    // analyze as they come in, don't need to finish getting roaylties on all
    for (const paidRoyalty of royaltiesPaidResult) {
      if (paidRoyalty.royaltiesPaid) {
        paid = true;
        break;
      }
    }
    if (paid) break;
  }

  return paid;
}

const hasPaidRoyaltiesAllNFTs = async (data) => {
  // in this case, we're going through all NFTs. When creating function for all NFTs required to pay royalties, find one from collecion and done
  const ownedCollectionNFTS = await isCollectionTokenInWallet({...data, detailed: true});
  let paid = true;

  // loop through each NFT owned and if any single one has royalties paid, return true
  for (const nft of ownedCollectionNFTS) {
    //loop breaks if the user has at least a single NFT with royalties paid
    if (!(await areRoyaltiesPaidOnNFt(nft)).royaltiesPaid) {
      paid = false;
      break;
    }    
  }
  return paid;
}

const royaltyOnAllNFTs = async (data) => {
  const ownedCollectionNFTS = await isCollectionTokenInWallet({...data, detailed: true});
  let response = [];

  for (const nft of ownedCollectionNFTS) {
    const paidRoyalties = await areRoyaltiesPaidOnNFt(nft)
    if (paidRoyalties.paid) {
      response.push({ tokenMintAddress: nft.mintAddress, ...paidRoyalties });
    } else {
      response.push({ tokenMintAddress: nft.mintAddress, ...paidRoyalties });
    }
  }
  return response;
}

const royaltyOnMintAddress = async (data) => {
  const { tokenMintAddress } = data;
  const nft = await getNftMetadata(tokenMintAddress);

  const paidRoyalties = await areRoyaltiesPaidOnNFt(nft);
  return paidRoyalties;
}

module.exports = {
  getCollectionRoyalties,
  isCollectionTokenInWallet,
  hasPaidRoyalties,
  hasPaidRoyaltiesAllNFTs,
  previousNftTransfers,
  lastTransfer,
  tokenAmountInWallet,
  royaltyOnAllNFTs,
  royaltyOnMintAddress
}