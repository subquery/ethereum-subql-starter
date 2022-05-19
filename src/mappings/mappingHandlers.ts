// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import {
  AvalancheBlockEntity,

  AvalancheLogEntity,
  AvalancheTransactionEntity,
  AvalancheReceiptEntity,
} from "../types";
import {
//  AvalancheBlock,
  AvalancheResult,
//  AvalancheTransaction,
} from "@subql/types-avalanche";

export type AvalancheBlock = {
  blockExtraData: string;
  difficulty: bigint;
  extDataGasUsed: string;
  extDataHash: string;
  gasLimit: bigint;
  gasUsed: bigint;
  hash: string;
  logs: AvalancheLog[];
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: number;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: bigint;
  stateRoot: string;
  timestamp: bigint;
  totalDifficulty: bigint;
  transactions: AvalancheTransaction[];
  transactionsRoot: string;
  uncles: string[];
  baseFeePerGas?: bigint;
  blockGasCost?: bigint;
};

export type AvalancheLog<T extends AvalancheResult = AvalancheResult> = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  args?: T;
};

export type AvalancheReceipt = {
  blockHash: string;
  blockNumber: number;
  contractAddress: string;
  cumulativeGasUsed: bigint;
  effectiveGasPrice: bigint;
  from: string;
  gasUsed: bigint;
  logs: AvalancheLog[];
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: string;
};

export type AvalancheTransaction<T extends AvalancheResult = AvalancheResult> = {
  blockHash: string;
  blockNumber: number;
  from: string;
  gas: bigint;
  gasPrice: bigint;
  hash: string;
  input: string;
  nonce: bigint;
  to: string;
  transactionIndex: bigint;
  value: bigint;
  type: string;
  v: bigint;
  r: string;
  s: string;
  receipt: AvalancheReceipt;
  accessList?: string[];
  chainId?: string;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  args?: T;
};

export async function handleBlock(block: AvalancheBlock): Promise<void> {
  const blockRecord = new AvalancheBlockEntity(block.hash);
  blockRecord.baseFeePerGas = block.baseFeePerGas;
  blockRecord.blockExtraData = block.blockExtraData;
  blockRecord.blockGasCost = block.blockGasCost;
  blockRecord.difficulty = block.difficulty;
  blockRecord.extDataGasUsed = block.extDataGasUsed;
  blockRecord.extDataHash = block.extDataHash;
  blockRecord.gasLimit = block.gasLimit;
  blockRecord.gasUsed = block.gasUsed;
  blockRecord.hash = block.hash;
  blockRecord.logsBloom = block.logsBloom;
  blockRecord.miner = block.miner;
  blockRecord.mixHash = block.mixHash;
  blockRecord.nonce = block.nonce;
  blockRecord.number = block.number;
  blockRecord.parentHash = block.parentHash;
  blockRecord.receiptsRoot = block.receiptsRoot;
  blockRecord.sha3Uncles = block.sha3Uncles;
  blockRecord.size = block.size;
  blockRecord.stateRoot = block.stateRoot;
  blockRecord.timestamp = block.timestamp;
  blockRecord.totalDifficulty = block.totalDifficulty;
  blockRecord.transactionsRoot = block.transactionsRoot;
  blockRecord.uncles = block.uncles;

  await blockRecord.save();
}

export async function handleTransaction(
  transaction: AvalancheTransaction
): Promise<void> {
  const transactionRecord = new AvalancheTransactionEntity(
    `${transaction.blockHash}-${transaction.hash}`
  );
  transactionRecord.blockId = transaction.blockHash;
  transactionRecord.blockHash = transaction.blockHash;
  transactionRecord.blockNumber = transaction.blockNumber;
  transactionRecord.from = transaction.from;
  transactionRecord.gas = transaction.gas;
  transactionRecord.gasPrice = transaction.gasPrice;
  transactionRecord.hash = transaction.hash;
  transactionRecord.input = transaction.input;
  transactionRecord.nonce = transaction.nonce;
  transactionRecord.to = transaction.to;
  transactionRecord.transactionIndex = transaction.transactionIndex;
  transactionRecord.value = transaction.value;
  transactionRecord.type = transaction.type;
  transactionRecord.v = transaction.v;
  transactionRecord.r = transaction.r;
  transactionRecord.s = transaction.s;
  transactionRecord.accessList = transaction.accessList;
  transactionRecord.chainId = transaction.chainId;
  transactionRecord.maxFeePerGas = transaction.maxFeePerGas;
  transactionRecord.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
  await transactionRecord.save();
}

export async function handleLog(log: AvalancheLog): Promise<void> {
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

export async function handleReceipt(transaction: AvalancheTransaction): Promise<void> {
  const receipt = transaction.receipt;
  const receiptRecord = new AvalancheReceiptEntity(`${receipt.blockHash}-${receipt.transactionHash}`);
  receiptRecord.blockId = receipt.blockHash;
  receiptRecord.blockHash = receipt.blockHash;
  receiptRecord.blockNumber = receipt.blockNumber;
  receiptRecord.contractAddress = receipt.contractAddress;
  receiptRecord.cumulativeGasUsed = receipt.cumulativeGasUsed;
  receiptRecord.effectiveGasPrice = receipt.effectiveGasPrice;
  receiptRecord.from = receipt.from;
  receiptRecord.gasUsed = receipt.gasUsed;
  receiptRecord.logsBloom = receipt.logsBloom;
  receiptRecord.status = receipt.status;
  receiptRecord.to = receipt.to;
  receiptRecord.transactionHash = receipt.transactionHash;
  receiptRecord.transactionIndex = receipt.transactionIndex;
  receiptRecord.type = receipt.type;
  await receiptRecord.save();
}
