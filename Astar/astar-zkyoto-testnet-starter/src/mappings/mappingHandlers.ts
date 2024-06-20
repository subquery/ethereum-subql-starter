import { Transaction } from "../types";
import assert from "assert";
import { EthereumTransaction } from "@subql/types-ethereum";

export async function handleTransaction(
  tx: EthereumTransaction,
): Promise<void> {
  const approval = Transaction.create({
    id: tx.hash,
    to: tx.to,
    from: tx.from,
    blockHeight: BigInt(tx.blockNumber),
  });

  await approval.save();
}
