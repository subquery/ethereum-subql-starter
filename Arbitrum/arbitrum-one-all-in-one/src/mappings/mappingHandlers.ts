import { EthereumBlock, EthereumLog, EthereumTransaction } from "@subql/types-ethereum";
import { Block, Log, TokenTransfer, Transaction, DecodedEvent, Receipt } from "../types";
import { ethers } from "ethers";
import assert from "assert";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  logger.info(`Handling block: ${block.number}`);
  await Block.create({
    id: block.hash,
    blockNumber: BigInt(block.number),
    blockTimestamp: new Date(Number(block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    parentHash: block.parentHash,
    size: block.size,
    // TODO: Add extraData to the block entity
    extraData: "",
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    baseFeePerGas: block.baseFeePerGas,
    mixHash: block.mixHash,
    nonce: BigInt(block.nonce),
    difficulty: block.difficulty,
    totalDifficulty: block.totalDifficulty,
    miner: block.miner,
    uncles: block.uncles,
    sha3Uncles: block.sha3Uncles,
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
  logger.info(`Handling transaction: ${call.hash}`);
  // TODO: Test with a node that supports the RPC method `getTransactionReceipt`
  // const receipt = await api.getTransactionReceipt(call.hash)
  await Promise.all([
    // Receipt.create({
    //   id: call.hash,
    //   blockNumber: BigInt(call.blockNumber),
    //   blockTimestamp: new Date(Number(call.blockTimestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    //   transactionHash: call.hash,
    //   transactionIndex: BigInt(call.transactionIndex),
    //   fromAddress: call.from,
    //   toAddress: call.to,
    //   contractAddress: receipt.contractAddress,
    //   cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed.toString()),
    //   gasUsed: BigInt(call.gas),
    //   effectiveGasPrice: BigInt(receipt.effectiveGasPrice.toString()),
    //   logsBloom: receipt.logsBloom,
    //   root: receipt.root || undefined,
    //   status: receipt.status ? BigInt(receipt.status) : undefined
    // }).save(),
    Transaction.create({
      id: call.hash,
      blockTimestamp: new Date(Number(call.blockTimestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
      transactionHash: call.hash,
      transactionIndex: BigInt(call.transactionIndex ?? 0),
      nonce: BigInt(call.nonce ?? 0),
      fromAddress: call.from,
      toAddress: call.to,
      value: BigInt(call.value ?? 0),
      gas: BigInt(call.gas ?? 0),
      gasPrice: BigInt(call.gasPrice ?? 0),
      input: call.input,
      maxFeePerGas: BigInt(call.maxFeePerGas ?? 0),
      transactionType: BigInt(call.type ?? 0),
      chainId: BigInt(call.chainId ?? 0),
      v: call.v?.toString() ?? "",
      r: call.r ?? "",
      s: call.s ?? "",
    }).save()
  ]);
}

async function handleLog(log: EthereumLog): Promise<void> {
  logger.info(`Handling log: ${log.transactionHash}-${log.logIndex}`);
  await Log.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber ?? 0),
    blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex ?? 0),
    logIndex: BigInt(log.logIndex ?? 0),
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

  const eventSignatures: { [key: string]: string } = {
    [ethers.utils.id("Burn(address,uint256,uint256,address)")]: "Burn(address,uint256,uint256,address)",
    [ethers.utils.id("Swap(address,address,int256,int256,uint160,uint128,int24)")]: "Swap(address,address,int256,int256,uint160,uint128,int24)",
    [ethers.utils.id("Burn(address,int24,int24,uint128,uint256,uint256)")]: "Burn(address,int24,int24,uint128,uint256,uint256)",
    [ethers.utils.id("Swap(address,uint256,uint256,uint256,uint256,address)")]: "Swap(address,uint256,uint256,uint256,uint256,address)",
    [ethers.utils.id("Flash(address,address,uint256,uint256,uint256,uint256)")]: "Flash(address,address,uint256,uint256,uint256,uint256)",
    [ethers.utils.id("Approval(address,address,uint256)")]: "Approval(address,address,uint256)",
    [ethers.utils.id("Collect(address,address,int24,int24,uint128,uint128)")]: "Collect(address,address,int24,int24,uint128,uint128)",
    [ethers.utils.id("Transfer(address,address,uint256)")]: "Transfer(address,address,uint256)",
    [ethers.utils.id("PairCreated(address,address,address,uint256)")]: "PairCreated(address,address,address,uint256)",
    [ethers.utils.id("PoolCreated(address,address,uint24,int24,address)")]: "PoolCreated(address,address,uint24,int24,address)",
    [ethers.utils.id("Withdrawal(address,uint256)")]: "Withdrawal(address,uint256)",
    [ethers.utils.id("Deposit(address,uint256)")]: "Deposit(address,uint256)",
    [ethers.utils.id("Initialize(uint160,int24)")]: "Initialize(uint160,int24)",
    [ethers.utils.id("Mint(address,uint256,uint256)")]: "Mint(address,uint256,uint256)",
    [ethers.utils.id("ApprovalForAll(address,address,bool)")]: "ApprovalForAll(address,address,bool)",
    [ethers.utils.id("Mint(address,address,int24,int24,uint128,uint256,uint256)")]: "Mint(address,address,int24,int24,uint128,uint256,uint256)",
    [ethers.utils.id("Sync(uint112,uint112)")]: "Sync(uint112,uint112)"
  };

  const eventSignature = eventSignatures[log.topics[0]];

  if (eventSignature) {
    const data: {
      id: string;
      blockNumber: bigint;
      blockTimestamp: string;
      transactionHash: string;
      transactionIndex: bigint;
      logIndex: bigint;
      address: string;
      eventHash: string;
      topics: string[];
      args: string[];
      removed: boolean;
      eventSignature: string;
    } = {
      id: log.transactionHash + "-" + log.logIndex.toString(),
      blockNumber: BigInt(log.blockNumber ?? 0),
      blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
      transactionHash: log.transactionHash,
      transactionIndex: BigInt(log.transactionIndex ?? 0),
      logIndex: BigInt(log.logIndex ?? 0),
      address: log.address,
      eventHash: log.topics[0],
      topics: log.topics,
      // TODO fix empty args
      args: log.args ? log.args.map((arg) => arg.toString()) : [],
      removed: log.removed,
      eventSignature: eventSignature
    };
    await DecodedEvent.create(data).save();
  }

}

async function handleERC20Transfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, amount] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber ?? 0),
    blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex ?? 0),
    eventIndex: BigInt(log.logIndex ?? 0),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC20Transfer",
    eventHash: log.topics[0],
    eventSignature: "Transfer(address,address,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: "",
    quantity: BigInt(amount ?? 0),
    removed: false
  }).save();
}

async function handleERC721Transfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenId] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber ?? 0),
    blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex ?? 0),
    eventIndex: BigInt(log.logIndex ?? 0),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC721Transfer",
    eventHash: log.topics[0],
    eventSignature: "Transfer(address,address,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: tokenId ?? "",
    quantity: BigInt(1),
    removed: false
  }).save();
}

async function handleERC1155SingleTransfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenId, value] = log.data;

  await TokenTransfer.create({
    id: log.transactionHash + "-" + log.logIndex.toString(),
    blockNumber: BigInt(log.blockNumber ?? 0),
    blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
    transactionHash: log.transactionHash,
    transactionIndex: BigInt(log.transactionIndex ?? 0),
    eventIndex: BigInt(log.logIndex ?? 0),
    batchIndex: BigInt(0),
    address: contractAddress,
    eventType: "ERC1155SingleTransfer",
    eventHash: log.topics[0],
    eventSignature: "TransferSingle(address,address,address,uint256,uint256)",
    operatorAddress: "",
    fromAddress: from,
    toAddress: to,
    tokenId: tokenId ?? "",
    quantity: BigInt(value ?? 0),
    removed: false
  }).save();
}

async function handleERC1155BatchTransfer(log: EthereumLog): Promise<void> {
  const contractAddress = log.address;
  const [from, to, tokenIds, values] = log.data;

  for (let i = 0; i < tokenIds.length; i++) {
    await TokenTransfer.create({
      id: log.transactionHash + "-" + log.logIndex.toString() + "-" + i.toString(),
      blockNumber: BigInt(log.blockNumber ?? 0),
      blockTimestamp: new Date(Number(log.block.timestamp) * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC'),
      transactionHash: log.transactionHash,
      transactionIndex: BigInt(log.transactionIndex ?? 0),
      eventIndex: BigInt(log.logIndex ?? 0),
      batchIndex: BigInt(i),
      address: contractAddress,
      eventType: "ERC1155BatchTransfer",
      eventHash: log.topics[0],
      eventSignature: "TransferBatch(address,address,address,uint256[],uint256[])",
      operatorAddress: "",
      fromAddress: from,
      toAddress: to,
      tokenId: tokenIds[i] ?? "",
      quantity: BigInt(values[i] ?? 0),
      removed: false
    }).save();
  }
}