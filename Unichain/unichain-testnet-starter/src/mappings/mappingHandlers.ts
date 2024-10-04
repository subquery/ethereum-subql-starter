import {
  EthereumBlock,
  EthereumLog,
  EthereumTransaction,
} from '@subql/types-ethereum';
import { EvmLog, EvmTransaction } from "../types/models";
import { inputToFunctionSighash, isZero } from './utils';

export async function handleBlock(block: EthereumBlock): Promise<void> {
 const logs = block.logs.map(log => handleLog(log));
 const transactions = await Promise.all(block.transactions.map(tx => handleTransaction(tx)));
 await Promise.all([
   store.bulkCreate('EvmLog', logs),
   store.bulkCreate('EvmTransaction', transactions)
 ]);
}

export function handleLog(log: EthereumLog): EvmLog {
 return EvmLog.create({
   id: `${log.blockNumber}-${log.logIndex}`,
   address: log.address.toLowerCase(),
   blockHeight: BigInt(log.blockNumber),
   topics0: log.topics[0]?.toLowerCase(),
   topics1: log.topics[1]?.toLowerCase(),
   topics2: log.topics[2]?.toLowerCase(),
   topics3: log.topics[3]?.toLowerCase(),
 });
}

export async function handleTransaction(transaction: EthereumTransaction,): Promise<EvmTransaction> {
 const func = isZero(transaction.input) ? undefined : inputToFunctionSighash(transaction.input).toLowerCase();
 return EvmTransaction.create({
   id: `${transaction.blockNumber}-${transaction.transactionIndex}`,
   blockHeight: BigInt(transaction.blockNumber),
   from: transaction.from.toLowerCase(),
   to: transaction.to?.toLowerCase() ?? '',
   txHash: transaction.hash,
   // If there are logs we can assume the tx was successful
   success: (!!transaction.logs?.length),
   func
 });
}