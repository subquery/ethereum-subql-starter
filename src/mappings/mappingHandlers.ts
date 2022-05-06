// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import {
  Approve,
  Transaction,
  AvalancheBlockEntity,
  AvalancheEventEntity,
  AvalancheTransactionEntity,
} from "../types";
import { AvalancheBlock, AvalancheEvent, AvalancheTransaction } from '@subql/types-avalanche'
import { BigNumber } from "ethers";
import assert from "assert";

type TransferEventArgs = [string, string, BigNumber] & {
  from: string;
  to: string;
  value: BigNumber;
};
type ApproveCallArgs = [string, BigNumber] & {
  spender: string;
  value: BigNumber;
};

export async function handleEvmEventTransfer(
  event: AvalancheEvent<TransferEventArgs>
): Promise<void> {
  assert(event.args, "Event Args not parsed");
  const transaction = new Transaction(event.transactionHash);
  transaction.value = event.args.value.toBigInt();
  transaction.from = event.args.from;
  transaction.to = event.args.to;
  transaction.contractAddress = event.address;
  logger.info("Saved Transaction: " + event.transactionHash.toString());
  await transaction.save();
}

export async function handleEvmCallApprove(
  transaction: AvalancheTransaction<ApproveCallArgs>
): Promise<void> {
  assert(transaction.args, "Call Args not parsed");
  const approve = new Approve(transaction.hash);
  approve.from = transaction.from;
  approve.spender = transaction.args.spender;
  approve.value = transaction.args.value.toBigInt();
  approve.contractAddress = transaction.to;
  await approve.save();
}

export async function handleBlock(block: AvalancheBlock): Promise<void> {
  const blockRecord = new AvalancheBlockEntity(block.hash);

  blockRecord.difficulty = block.difficulty;
  blockRecord.extraData = block.extraData;
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

export async function handleCall(
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
  transactionRecord.r = transaction.r;
  transactionRecord.s = transaction.s;
  transactionRecord.to = transaction.to;
  transactionRecord.transactionIndex = transaction.transactionIndex;
  transactionRecord.v = transaction.v;
  transactionRecord.value = transaction.value;

  await transactionRecord.save();
}

export async function handleEvent(event: AvalancheEvent): Promise<void> {
  const eventRecord = new AvalancheEventEntity(
    `${event.blockHash}-${event.logIndex}`
  );

  eventRecord.address = event.address;
  eventRecord.blockHash = event.blockHash;
  eventRecord.blockId = event.blockHash;
  eventRecord.blockNumber = event.blockNumber;
  eventRecord.data = event.data;
  eventRecord.logIndex = event.logIndex;
  eventRecord.topics = event.topics;
  eventRecord.transactionHash = event.transactionHash;
  eventRecord.transactionIndex = event.transactionIndex;

  await eventRecord.save();
}
