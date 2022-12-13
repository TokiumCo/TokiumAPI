const creatorArrHasAddress = (creators, address) => {
  for (const creator of creators) {
    if (creator.address === address) {
      return true;
    }
  }
  return false;
}

const getCreatorPaymentsFromTransfers = (transfers, creators) => {
  let totalPaymentToCreators = 0;
  let numberCreatorsPaid = 0;
  for (const transfer of transfers) {
    if (creatorArrHasAddress(creators, transfer.destination)) {
      totalPaymentToCreators += transfer.amount;
      numberCreatorsPaid++;
    }

    // break internal if all creators covered
    if (numberCreatorsPaid === creators.length) break;
  }
  return { payments: totalPaymentToCreators, number: numberCreatorsPaid };
}

const getCreatorPaymentsFromUnknownTransfers = (unknownTransfers, creators) => {
  let totalPaymentToCreators = 0;
  let numberCreatorsPaid = 0;
  for (const program of unknownTransfers) {
    const transfers = program.event;
    const { payments, number } = getCreatorPaymentsFromTransfers(transfers, creators);
    totalPaymentToCreators += payments;
    numberCreatorsPaid += number;
     // break overall if all creators covered
     if (numberCreatorsPaid === creators.length) break;
  }
  return {paidUnknown: totalPaymentToCreators, numberCreatorsPaidUnkown: numberCreatorsPaid};
}

const getCreatorsPaidFromSolTransfers = (solTransfers, creators) => {
  const { payments, number } = getCreatorPaymentsFromTransfers(solTransfers, creators);
  return {paidTransfers: payments, numberCreatorsPaidTransfers: number}
}

const getCreatorPayments = (tranactionDetails, creators) => {
  const { paidUnknown, numberCreatorsPaidUnkown } = getCreatorPaymentsFromUnknownTransfers(tranactionDetails.unknownTransfers, creators);
  const { paidTransfers, numberCreatorsPaidTransfers } = getCreatorsPaidFromSolTransfers(tranactionDetails.solTransfers, creators);
  const paid = paidTransfers + paidUnknown;
  const number = numberCreatorsPaidUnkown + numberCreatorsPaidTransfers;
  return { paid, number };
}

// logic is seller got paid the most and the rest were paid a percentage of the sale amount
const getBuyerPaidFromUnknownTransfers = (unknownTransfers, signerArr) => {
  let buyerPaid = 0;
  for (const program of unknownTransfers) {
    const transfers = program.event;
    for (const transfer of transfers) {
      if (signerArr.includes(transfer.source)) {
        if (buyerPaid < transfer.amount) buyerPaid = transfer.amount;
      } 
    }
  }
  return buyerPaid;
}

const cleanupTransferReturn = (transfers) => {
  const toReturn = transfers && transfers.map((transfer) => {
    return {
      txHash: transfer.txHash,
      sourceTokenAccount: transfer.sourceTokenAccount,
      destTokenAccount: transfer.destTokenAccount,
      sourceOwnerAccount: transfer.sourceOwnerAccount,
      tokenAddress: transfer.tokenAddress,
      tokenInfo: transfer.tokenInfo,
      type: transfer.parseType
    }
  });
  return toReturn;
}

const cleanupTransactionDetails = (tranaction) => {
  const toReturn = {
    blockTime: tranaction.blockTime,
    signer: tranaction.signer,
    recentBlockhash: tranaction.recentBlockhash,
    innerInstructions: tranaction.innerInstructions,
    tokenTransfers: tranaction.tokenTransfers,
    solTransfers: tranaction.solTransfers,
    serumTransactions: tranaction.serumTransactions,
    raydiumTransactions: tranaction.raydiumTransactions,
    unknownTransfers: tranaction.unknownTransfers,
    txHash: tranaction.txHash
  }
  return toReturn;
};



module.exports = {
  getBuyerPaidFromUnknownTransfers,
  getCreatorPayments,
  cleanupTransactionDetails,
  cleanupTransferReturn
}