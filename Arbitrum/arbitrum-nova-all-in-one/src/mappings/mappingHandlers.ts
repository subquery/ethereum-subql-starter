import { EthereumBlock, EthereumLog, EthereumTransaction } from "@subql/types-ethereum";
import { Block, AccountState, Log, Receipt, TokenTransfer, Transaction } from "../types";
import { ethers } from "ethers";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  await Block.create({
    id: block.hash,
    blockNumber: BigInt(block.number),
    blockTimestamp: block.timestamp,
    parentHash: block.parentHash,
    size: block.size,
    extraData: block.blockExtraData,
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    baseFeePerGas: block.baseFeePerGas,
    mixHash: block.mixHash,
    nonce: block.nonce,
    difficulty: block.difficulty,
    totalDifficulty: block.totalDifficulty,
    miner: block.miner,
    sha3Uncles: block.sha3Uncles,
    transactionCount: BigInt(block.transactions.length),
    transactionsRoot: block.transactionsRoot,
    receiptsRoot: block.receiptsRoot,
    stateRoot: block.stateRoot,
    logsBloom: block.logsBloom
  }).save();

  for (const transaction of block.transactions) {
    await handleCall(transaction);
  }

  for (const log of block.logs) {
    await handleLog(log);
  }
}

async function handleCall(call: EthereumTransaction): Promise<void> {
  const account = call.from;
  const block = await api.getBlock(`${call.blockNumber}`);
  const [nonce, balance, code, receipt] = await Promise.all([
    api.getTransactionCount(account, call.blockNumber),
    api.getBalance(account, call.blockNumber),
    api.getCode(account, call.blockNumber),
    api.getTransactionReceipt(call.hash)
  ]);
  const codeHash = ethers.utils.keccak256(code);

  await Promise.all([
    AccountState.create({
      id: `${account}-${call.blockNumber}`,
      blockNumber: BigInt(call.blockNumber),
      blockTimestamp: BigInt(block.timestamp),
      address: account,
      nonce: BigInt(nonce),
      balance: BigInt(balance.toString()),
      codeHash: codeHash,
      code: code
    }).save(),

    Receipt.create({
      id: call.hash,
      blockNumber: BigInt(call.blockNumber),
      blockTimestamp: BigInt(block.timestamp),
      transactionHash: call.hash,
      transactionIndex: BigInt(call.transactionIndex),
      fromAddress: call.from,
      toAddress: call.to,
      contractAddress: receipt.contractAddress,
      cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed.toString()),
      gasUsed: BigInt(call.gas),
      effectiveGasPrice: BigInt(receipt.effectiveGasPrice.toString()),
      logsBloom: receipt.logsBloom,
      root: receipt.root || undefined,
      status: receipt.status ? BigInt(receipt.status) : undefined
    }).save(),

    Transaction.create({
      id: call.hash,
      blockNumber: BigInt(call.blockNumber),
      blockTimestamp: BigInt(block.timestamp),
      transactionHash: call.hash,
      transactionIndex: BigInt(call.transactionIndex),
      nonce: BigInt(call.nonce),
      fromAddress: call.from,
      toAddress: call.to,
      value: BigInt(call.value),
      gas: BigInt(call.gas),
      gasPrice: BigInt(call.gasPrice),
      input: call.input,
      maxFeePerGas: BigInt(call.maxFeePerGas ?? 0),
      // TODO figure out how to identify the type of transaction
      transactionType: BigInt(0),
      chainId: BigInt(call.chainId ?? 0),
      v: call.v.toString(),
      r: call.r,
      s: call.s,
      // TODO add yParity
    }).save()
  ]);
}

async function handleLog(log: EthereumLog): Promise<void> {
  await Log.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber),
    blockTimestamp: BigInt(log.block.timestamp),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex),
    logIndex: BigInt(log.logIndex),
    address: log.address,
    data: log.data,
    topics: log.topics,
    removed: log.removed
  }).save();

  if (log.topics[0] === ethers.utils.id("Transfer(address,address,uint256)")) {
    await handleERC20Transfer(log);
  } else if (log.topics[0] === ethers.utils.id("Transfer(address,address,uint256)")) {
    await handleERC721Transfer(log);
  } else if (log.topics[0] === ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)")) {
    await handleERC1155SingleTransfer(log);
  } else if (log.topics[0] === ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")) {
    await handleERC1155BatchTransfer(log);
  }
}

async function handleERC20Transfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, amount] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber),
    blockTimestamp: BigInt(log.block.timestamp),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex),
    eventIndex: BigInt(log.logIndex),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC20Transfer",
    eventHash: log.topics[0],
    eventSignature: "Transfer(address,address,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: "",
    quantity: BigInt(amount),
    removed: false
  }).save();
}

async function handleERC721Transfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenId] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber),
    blockTimestamp: BigInt(log.block.timestamp),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex),
    eventIndex: BigInt(log.logIndex),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC721Transfer",
    eventHash: log.topics[0],
    eventSignature: "Transfer(address,address,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: tokenId,
    quantity: BigInt(1),
    removed: false
  }).save();
}

async function handleERC1155SingleTransfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenId, value] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber),
    blockTimestamp: BigInt(log.block.timestamp),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex),
    eventIndex: BigInt(log.logIndex),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC1155SingleTransfer",
    eventHash: log.topics[0],
    eventSignature: "TransferSingle(address,address,address,uint256,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: tokenId,
    quantity: BigInt(value),
    removed: false
  }).save();
}

async function handleERC1155BatchTransfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenIds, values] = log.data;

  for (let i = 0; i < tokenIds.length; i++) {
    await TokenTransfer.create({
      id: log.transactionHash + "-" + log.logIndex.toString() + "-" + i.toString(),
      blockNumber: BigInt(log.blockNumber),
      blockTimestamp: BigInt(log.block.timestamp),
      transactionHash: log.transactionHash,
      transactionIndex: BigInt(log.transactionIndex),
      eventIndex: BigInt(log.logIndex),
      batchIndex: BigInt(i),
      address: contractAddress,
      eventType: "ERC1155BatchTransfer",
      eventHash: log.topics[0],
      eventSignature: "TransferBatch(address,address,address,uint256[],uint256[])",
      operatorAddress: "",
      fromAddress: from,
      toAddress: to,
      tokenId: tokenIds[i],
      quantity: BigInt(values[i]),
      removed: false
    }).save();
  }
}