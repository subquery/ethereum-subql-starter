// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import {
  AvalancheBlockEntity,

  AvalancheLogEntity,
  AvalancheTransactionEntity,
  AvalancheReceiptEntity,
} from "../types";
import {
  EthereumTransaction,
  EthereumLog,
  EthereumBlock,
} from "@subql/types-avalanche";
import { ethers } from "ethers";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  logger.info(`Handling block ${block.number}`);
  const blockRecord = new AvalancheBlockEntity(block.hash);
  //blockRecord.baseFeePerGas = block.baseFeePerGas.toBigInt();
  //blockRecord.blockExtraData = block.blockExtraData;
  //blockRecord.blockGasCost = block.blockGasCost;
  blockRecord.difficulty = BigInt(block.difficulty);
  //blockRecord.extDataGasUsed = block.extDataGasUsed;
  //lockRecord.extDataHash = block.extDataHash;
  blockRecord.gasLimit = block.gasLimit.toBigInt();
  blockRecord.gasUsed = block.gasUsed.toBigInt();
  blockRecord.hash = block.hash;
  //blockRecord.logsBloom = block.logsBloom;
  blockRecord.miner = block.miner;
  //blockRecord.mixHash = block.mixHash;
  blockRecord.nonce = block.nonce;
  blockRecord.number = block.number;
  blockRecord.parentHash = block.parentHash;
  //blockRecord.receiptsRoot = block.receiptsRoot;
  //blockRecord.sha3Uncles = block.sha3Uncles;
  //blockRecord.size = block.size;
  //blockRecord.stateRoot = block.stateRoot;
  blockRecord.timestamp = BigInt(block.timestamp);
  //blockRecord.totalDifficulty = block.totalDifficulty;
  //blockRecord.transactionsRoot = block.transactionsRoot;
  //blockRecord.uncles = block.uncles;

  await blockRecord.save();
}

export async function handleTransaction(
  transaction: EthereumTransaction
): Promise<void> {
  const transactionRecord = new AvalancheTransactionEntity(
    `${transaction.blockHash}-${transaction.hash}`
  );
  transactionRecord.blockId = transaction.blockHash;
  transactionRecord.blockHash = transaction.blockHash;
  transactionRecord.blockNumber = transaction.blockNumber;
  transactionRecord.from = transaction.from;
  transactionRecord.gas = transaction.receipt.gasUsed.toBigInt();
  transactionRecord.gasPrice = transaction.gasPrice.toBigInt();
  transactionRecord.hash = transaction.hash;
  transactionRecord.input = transaction.data;
  transactionRecord.nonce = BigInt(transaction.nonce);
  transactionRecord.to = transaction.to;
  transactionRecord.transactionIndex = BigInt(transaction.receipt.transactionIndex);
  transactionRecord.value = transaction.value.toBigInt();
  transactionRecord.type = transaction.type.toString();
  transactionRecord.v = BigInt(transaction.v);
  transactionRecord.r = transaction.r;
  transactionRecord.s = transaction.s;
  //transactionRecord.accessList = transaction.accessList;
  transactionRecord.chainId = transaction.chainId.toString();
  transactionRecord.maxFeePerGas = transaction.maxFeePerGas.toBigInt();
  transactionRecord.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas.toBigInt();
  await transactionRecord.save();
}

export async function handleLog(log: EthereumLog): Promise<void> {
  const logRecord = new AvalancheLogEntity(
    `${log.blockHash}-${log.logIndex}`
  );
  logRecord.blockId = log.blockHash;
  logRecord.address = log.address;
  logRecord.blockHash = log.blockHash;
  logRecord.blockNumber = log.blockNumber;
  logRecord.data = log.data;
  logRecord.logIndex = log.logIndex;
  logRecord.removed = log.removed;
  logRecord.topics = log.topics;
  logRecord.transactionHash = log.transactionHash;
  logRecord.transactionIndex = log.transactionIndex;
  await logRecord.save();
}

export async function handleReceipt(transaction: EthereumTransaction): Promise<void> {
  const receipt = transaction.receipt;
  const receiptRecord = new AvalancheReceiptEntity(`${receipt.blockHash}-${receipt.transactionHash}`);
  receiptRecord.blockId = receipt.blockHash;
  receiptRecord.blockHash = receipt.blockHash;
  receiptRecord.blockNumber = receipt.blockNumber;
  receiptRecord.contractAddress = receipt.contractAddress;
  receiptRecord.cumulativeGasUsed = receipt.cumulativeGasUsed.toBigInt();
  receiptRecord.effectiveGasPrice = receipt.effectiveGasPrice.toBigInt();
  receiptRecord.from = receipt.from;
  receiptRecord.gasUsed = receipt.gasUsed.toBigInt();
  receiptRecord.logsBloom = receipt.logsBloom;
  receiptRecord.status = receipt.status !== 0;
  receiptRecord.to = receipt.to;
  receiptRecord.transactionHash = receipt.transactionHash;
  receiptRecord.transactionIndex = receipt.transactionIndex;
  receiptRecord.type = receipt.type.toString();
  await receiptRecord.save();
}
