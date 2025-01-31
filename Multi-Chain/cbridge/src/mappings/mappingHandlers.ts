import assert from "assert";
import {
  TransactionOnSource,
  TransactionOnTarget,
  BridgeTransaction,
} from "../types";

import { SendLog, RelayLog } from "../types/abi-interfaces/Bridge";

export async function handleSend(event: SendLog): Promise<void> {
  assert(event.args);

  const transactionOnSource = TransactionOnSource.create({
    id: event.args.transferId,
    transferId: event.args.transferId,
    sender: event.args.sender,
    receiver: event.args.receiver,
    token: event.args.token,
    amount: event.args.amount.toBigInt(),
    dstChain: event.args.dstChainId.toBigInt(),
    nonce: event.args.nonce.toBigInt(),
    maxSlippage: BigInt(event.args.maxSlippage),
  });
  await transactionOnSource.save();

  let bridgeTransactionRecord = await BridgeTransaction.get(
    event.args.transferId.toString(),
  );
  if (!bridgeTransactionRecord) {
    bridgeTransactionRecord = BridgeTransaction.create({
      id: event.args.transferId.toString(),
    });
  }
  bridgeTransactionRecord.transactionOnSourceId = transactionOnSource.id;
  await bridgeTransactionRecord.save();
}

export async function handleRelay(event: RelayLog): Promise<void> {
  assert(event.args);

  const transactionOnTarget = TransactionOnTarget.create({
    id: event.args.transferId,
    transferId: event.args.transferId,
    sender: event.args.sender,
    receiver: event.args.receiver,
    token: event.args.token,
    amount: event.args.amount.toBigInt(),
    srcChain: event.args.srcChainId.toBigInt(),
    srcTransferId: event.args.srcTransferId,
  });
  await transactionOnTarget.save();

  let bridgeTransactionRecord = await BridgeTransaction.get(
    event.args.srcTransferId.toString(),
  );
  if (!bridgeTransactionRecord) {
    bridgeTransactionRecord = BridgeTransaction.create({
      id: event.args.srcTransferId.toString(),
    });
  }
  bridgeTransactionRecord.transactionOnTargetId = transactionOnTarget.id;
  await bridgeTransactionRecord.save();
}
