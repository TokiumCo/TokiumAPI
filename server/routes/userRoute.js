const express = require('express');
const { verifyData2, verifyData1, verifyData3 } = require('../middleware/verifyData');
const router = express.Router();
const userService = require('../services/userService')

router.get('/', (req, res) => {
  res.send('Welcome to the fastest NFT API in the world!')
});

router.post('/collectionRoyalties', verifyData2, (req, res) => {
  userService.getCollectionRoyalties(req.body).then(royalties => {
    res.send(royalties)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
})

router.post('/ownedCollectionNFTs', verifyData1, (req, res) => {
  userService.isCollectionTokenInWallet(req.body).then(nft => {
    res.status(200).send(nft)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});

router.post('/amountCollectionNFTs', verifyData1, (req, res) => {
  userService.tokenAmountInWallet(req.body).then(nft => {
    res.status(200).send(nft)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});


router.post('/hasPaidRoyalties', verifyData1, (req, res) => {
  userService.hasPaidRoyalties(req.body).then(nft => {
    res.send(nft)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});

router.post('/hasPaidAllRoyalties', verifyData1, (req, res) => {
  userService.hasPaidRoyaltiesAllNFTs(req.body).then(paid => {
    res.send(paid)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});

router.post('/royaltyDetails', verifyData1, (req,res) => {
  userService.royaltyOnAllNFTs(req.body).then(paid => {
    res.send(paid)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
})


router.post('/royaltyOnMintAddress', verifyData3, (req,res) => {
  userService.royaltyOnMintAddress(req.body).then(paid => {
    res.send(paid)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
})

router.post('/previousNftTransfers', verifyData3, (req, res) => {
  userService.previousNftTransfers(req.body).then(data => {
    res.send(data)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});

router.post('/lastTransfer', verifyData3, (req, res) => {
  userService.lastTransfer(req.body).then(data => {
    res.send(data)
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
});




module.exports = router;
