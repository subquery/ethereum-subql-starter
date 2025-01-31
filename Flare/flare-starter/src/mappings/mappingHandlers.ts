import {
  EthereumTransaction,
  EthereumLog,
  EthereumBlock,
} from "@subql/types-ethereum";
import { BigNumber } from "@ethersproject/bignumber";
import { HashSubmittedEvent, SubmitHash } from "../types";
import assert from "assert";

// Setup types from ABI
type HashSubmittedEventArgs = [string, BigNumber, string, BigNumber] & {
  submitter: string;
  epochId: BigNumber;
  hash: string;
  timestamp: BigNumber;
};

type SubmitHashCallArgs = [BigNumber, string] & {
  epochId: BigNumber;
  hash: string;
};

/*
export async function handleBlock(block: EthereumBlock): Promise<void> {
  // do something with each and every block
}
*/

export async function handleLog(
  log: EthereumLog<HashSubmittedEventArgs>,
): Promise<void> {
  assert(log.args, "No log.args");
  const transaction = HashSubmittedEvent.create({
    id: log.transactionHash,
    submitter: log.args.submitter,
    epochId: log.args.epochId.toBigInt(),
    hash: log.args.hash,
    timestamp: log.args.timestamp.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleTransaction(
  transaction: EthereumTransaction<SubmitHashCallArgs>,
): Promise<void> {
  assert(transaction.args, "No transaction.args");
  assert(transaction.to, "No transaction.to");
  const approval = SubmitHash.create({
    id: transaction.hash,
    epochId: JSON.parse(transaction.args[0].toString()),
    hash: transaction.args[1],
    contractAddress: transaction.to,
  });

  await approval.save();
}
