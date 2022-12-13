
const verifyPaidRoyalties = (royaltiesPercent, percentRoyaltiesPaid, buyPrice) => {
  // convert everything to numbers of 2 decimals
  const expectedRoyalties = parseFloat((royaltiesPercent))
  const paidRoyalties = parseFloat((percentRoyaltiesPaid))
  const tolerance = 0.1;
  const toReturn = {}
  if (paidRoyalties > (expectedRoyalties - tolerance) && paidRoyalties < (expectedRoyalties + tolerance)) {
    toReturn.royaltiesPaid = true;
    toReturn.royaltiesOwing = 0;
  } else {
    toReturn.royaltiesPaid = false;
    toReturn.royaltiesOwing = parseFloat((((buyPrice * (expectedRoyalties / 100)) - (buyPrice * (paidRoyalties / 100))) / 1000000000).toFixed(4));
  }

  return toReturn;
}

const getIp = () => {
  var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
  return ip;
}

function createGroups(arr, chunk) {
  const toReturn = [];
  while(arr.length > 0) {
    let tempArray;
    tempArray = arr.splice(0, chunk);
    toReturn.push(tempArray);
  }
  return toReturn;
}


module.exports = {
  getIp,
  verifyPaidRoyalties,
  createGroups
}