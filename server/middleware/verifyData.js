/**
 * The APIs take 3 types of data. Each one is outlined in the docs
 */

const verifyData1 = async (req, res, next) => {
  const { collectionLink, address } = req.body;
  if (!collectionLink || !address) {
    console.log('Rejecting with bad data1: ', req.body)
    return res.status(400).send('Bad data')
  }
  next();
}

const verifyData2 = async (req, res, next) => {
  const { collectionLink } = req.body;
  if (!collectionLink) {
    console.log('Rejecting with bad data2: ', req.body)
    return res.status(400).send('Bad data')
  }
  next();
}

const verifyData3 = async (req, res, next) => {
  const { tokenMintAddress } = req.body;
  if (!tokenMintAddress) {
    console.log('Rejecting with bad data3: ', req.body)
    return res.status(400).send('Bad data')
  }
  next();
}


module.exports = {
  verifyData1,
  verifyData2,
  verifyData3
}