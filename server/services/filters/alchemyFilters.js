const creatorArrHasAddress = (creators, address) => {
  if (!address) return false;
  for (const creator of creators) {
    if (creator.address === address) {
      return true;
    }
  }
  return false;
}

const getCreatorPaymentsFromInstructions = (instructions, creators) => {
  let totalPaymentToCreators = 0;
  let numberCreatorsPaid = 0;
  for (const instruction of instructions) {
    const dataType = instruction?.parsed?.type;
    const info = instruction?.parsed?.info;
    if (dataType === "transfer" && creatorArrHasAddress(creators, info?.destination) ) {
      totalPaymentToCreators += info.lamports;
      numberCreatorsPaid++;
    }
  }
  return {paidUnknown: totalPaymentToCreators, numberCreatorsPaidUnkown: numberCreatorsPaid};
}

const getCreatorsPaidFromInnerInstructions = (innerInstructions, creators) => {
  let payments = 0;
  let number = 0;
  for (const innerInstruction of innerInstructions) {
    const instructions = innerInstruction.instructions;
    for (const instruction of instructions) {
      const dataType = instruction?.parsed?.type;
      const info = instruction?.parsed?.info;
      if (dataType === "transfer" && creatorArrHasAddress(creators, info?.destination) ) {
        payments += info.lamports;
        number++;
      }
    }
  }
  return {paidInstructions: payments, numberCreatorsPaidInstructions: number}
}

const getCreatorPaymentsAlchemy = (tranactionDetails, creators) => {
  const innerInstructions = tranactionDetails.innerInstructions;
  const instructions = tranactionDetails.instructions;
  const { paidUnknown, numberCreatorsPaidUnkown } = getCreatorPaymentsFromInstructions(instructions, creators);
  const { paidInstructions, numberCreatorsPaidInstructions } = getCreatorsPaidFromInnerInstructions(innerInstructions, creators);
  const paid = paidInstructions + paidUnknown;
  const number = numberCreatorsPaidUnkown + numberCreatorsPaidInstructions;
  return { paid, number };
}

const getPaidToBuyInnerInstuctions = (innerInstructions) => {
  let paid = 0;
  for (const innerInstruction of innerInstructions) {
    const instructions = innerInstruction.instructions;
    for (const instruction of instructions) {
      const dataType = instruction?.parsed?.type;
      const info = instruction?.parsed?.info;

      // assume buyer paid the most out of all parties
      if (dataType === "transfer" && paid < info?.lamports ) {
        paid = info.lamports;
      }
    }
  }
  return paid;
}

// logic is seller got paid the most and the rest were paid a percentage of the sale amount
const getBuyerPaidAlchemy = (transactionDetails) => {
  const innerInstructions = transactionDetails.innerInstructions;
  const paid = getPaidToBuyInnerInstuctions(innerInstructions);

  return paid;
}


const cleanupTransactionDetailsAlchemy = (data) => {
  const result = data?.result;
  if (!result) return {};
  const meta = data.result?.meta;
  const innerInstructions = meta.innerInstructions;
  const transaction = data.result?.transaction;
  const transactionMessage = transaction.message;
  const signatures = transaction.signatures;
  const instructions = transactionMessage.instructions;
  const recentBlockhash = transactionMessage.recentBlockhash;

  const toReturn = {
    recentBlockhash: recentBlockhash,
    innerInstructions: innerInstructions,
    instructions: instructions,
    signatures: signatures,
    txHash:data.txHash
  }
  return toReturn;
};



module.exports = {
  getBuyerPaidAlchemy,
  getCreatorPaymentsAlchemy,
  cleanupTransactionDetailsAlchemy,
}