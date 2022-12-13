//loop through all NFTs owned by user and check if they have the needed one (helper function)
const hasNFT = (NFTcollected, collectionSymbol) => {
  const nfts = []
  for (const nft of NFTcollected) {
    if (nft.collection === collectionSymbol) nfts.push(cleanupNFTData(nft));
  }
  return nfts;
}

const cleanupNFTData = (nft) => {
  const toReturn = {
    mintAddress: nft.mintAddress,
    sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
    collection: nft.collection,
    creators: nft.properties.creators,
    owner: nft.owner,
    image: nft.image,
    name: nft.name
  }
  return toReturn;
}

// returns collection symbol based on a given link
const getMagicEdenCollectionSymbol = (collectionLink) => {
  let collectionSymbol = collectionLink.split('/');
  if (!collectionSymbol.includes('magiceden.io')) throw ('Invalid Link')
  collectionSymbol = (collectionSymbol[collectionSymbol.length - 1]).split('?'); //remove query
  return collectionSymbol[0];
}



module.exports = {
  hasNFT,
  getMagicEdenCollectionSymbol,
  cleanupNFTData
}