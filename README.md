# TokiumAPI
Accessible at https://api.tokium.co 
See endpoints below or at https://documenter.getpostman.com/view/12742382/2s8Yt1rUot#eb852522-ffdc-4fd9-be99-3958e518cdb1

## Use Cases

The API is focused of Solana NFTs. Here are some of the use cases:
- Royalty-gating content
- Analyzing wallets with 1000s of NFTs at once
- Getting royalties percent for certain collections
- Getting previous sales of the NFT (excluding direct transfers)
- Getting a list of all collection NFTs owned by a wallet
- Getting the number of collection NFTs owned by a wallet

## Royalty Gating Logic

We believe that a user may directly transfer their NFT to different wallets without having to pay royalties. Many users in the space follow this method where they do transactions from a "burner-wallet" and later transfer their assets to a safer location.
Following this, we only check for royalties when a sale of the NFT occurs in exchange of money, or some other asset. To verify the royalties are paid, the entire transaction map of the NFT transfer is traversed to identify if the creators were paid in full amount.
For further details: See our WHITEPAPER: https://www.tokium.co/blog/tokium-whitepaper


## To Run Locally
```
yarn install
node index.js
```
