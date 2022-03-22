// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import {AvalancheBlockEntity, AvalancheEventEntity, AvalancheTransactionEntity, Harvest, Transaction} from "../types";
import { BigNumber } from "ethers";

// TODO: those 3 types are duplicate from subql/types
// We have to find a way to import them from our version of the package
export type AvalancheBlock = {
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: AvalancheTransaction[];
  transactionsRoot: string;
  uncles: string[];
};

export type AvalancheTransaction = {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  v: string;
  r: string;
  s: string;
};

export type AvalancheEvent = {
  logIndex: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
  transactionIndex: string;
  address: string;
  data: string;
  topics: string[];
};

// TODO: same for this interface
export interface BlockWrapper {
  getBlock: () => AvalancheBlock;
  getBlockHeight: () => number;
  getHash: () => string;
  getCalls?: (filters?: any) => | AvalancheTransaction[];
  getEvents: () => AvalancheEvent[];
  getVersion: () => number;
}

export async function handleBlock(block: BlockWrapper): Promise<void> {
  let avalancheBlock: AvalancheBlock = block.getBlock();
  const blockRecord = new AvalancheBlockEntity(avalancheBlock.hash);

  blockRecord.difficulty = avalancheBlock.difficulty;
  blockRecord.extraData = avalancheBlock.extraData;
  blockRecord.gasLimit = avalancheBlock.gasLimit;
  blockRecord.gasUsed = avalancheBlock.gasUsed;
  blockRecord.hash = avalancheBlock.hash;
  blockRecord.logsBloom = avalancheBlock.logsBloom;
  blockRecord.miner = avalancheBlock.miner;
  blockRecord.mixHash = avalancheBlock.mixHash;
  blockRecord.nonce = avalancheBlock.nonce;
  blockRecord.number = avalancheBlock.number;
  blockRecord.parentHash = avalancheBlock.parentHash;
  blockRecord.receiptsRoot = avalancheBlock.receiptsRoot;
  blockRecord.sha3Uncles = avalancheBlock.sha3Uncles;
  blockRecord.size = avalancheBlock.size;
  blockRecord.stateRoot = avalancheBlock.stateRoot;
  blockRecord.timestamp = avalancheBlock.timestamp;
  blockRecord.totalDifficulty = avalancheBlock.totalDifficulty;
  blockRecord.transactionsRoot = avalancheBlock.transactionsRoot;
  blockRecord.uncles = avalancheBlock.uncles;

  await blockRecord.save();
}

export async function handleCall(transaction: AvalancheTransaction): Promise<void> {
  const transactionRecord = new AvalancheTransactionEntity(`${transaction.blockHash}-${transaction.hash}`)

  transactionRecord.blockId = transaction.blockHash
  transactionRecord.blockHash = transaction.blockHash;
  transactionRecord.blockNumber = transaction.blockNumber;
  transactionRecord.from = transaction.from;
  transactionRecord.gas = transaction.gas;
  transactionRecord.gasPrice = transaction.gasPrice;
  transactionRecord.hash = transaction.hash;
  transactionRecord.input = transaction.input;
  transactionRecord.nonce = transaction.nonce;
  transactionRecord.r = transaction.r;
  transactionRecord.s = transaction.s;
  transactionRecord.to = transaction.to;
  transactionRecord.transactionIndex = transaction.transactionIndex;
  transactionRecord.v = transaction.v;
  transactionRecord.value = transaction.value;

  await transactionRecord.save();
}

export async function handleEvent(event: AvalancheEvent): Promise<void> {
  const eventRecord = new AvalancheEventEntity(`${event.blockHash}-${event.logIndex}`);

  eventRecord.address = event.address
  eventRecord.blockHash = event.blockHash
  eventRecord.blockId = event.blockHash
  eventRecord.blockNumber = event.blockNumber
  eventRecord.data = event.data
  eventRecord.logIndex = event.logIndex
  eventRecord.topics = event.topics
  eventRecord.transactionHash = event.transactionHash
  eventRecord.transactionIndex = event.transactionIndex

  await eventRecord.save()
}


type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; value: BigNumber; };
type ApproveCallArgs = [string, BigNumber] & { _spender: string; _value: BigNumber; }

export async function handleEvmEventTransfer(event: AvalancheEvent): Promise<void> {
  const transaction = new Transaction(event.transactionHash);
  // transaction.value = event.args.value.toBigInt();
  // transaction.from = event.args.from;
  // transaction.to = event.args.to;
  // transaction.contractAddress = event.address;
  await transaction.save();
}


export async function handleEvmCallHarvest(transaction: AvalancheTransaction): Promise<void> {
  const approval = new Harvest(transaction.hash);

  approval.from = transaction.from;
  approval.contractAddress = transaction.to;

  // approval.value = transaction.args._value.toBigInt();
  // approval.pid = transaction.args.pid;

  await approval.save();
}
