import { Approval, Transfer } from "../types";
import {
  ApproveTransaction,
  TransferLog,
} from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";

export async function handleTransaction(tx: ApproveTransaction): Promise<void> {
  assert(tx.args, "No tx.args");
  logger.info(`New Approval transaction at block ${tx.blockNumber}`);

  const approvalRecord = Approval.create({
    id: tx.hash,
    blockHeight: tx.blockNumber.toString(),
    owner: tx.from,
    spender: (await tx.args[0]).toString(),
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to,
  });

  await approvalRecord.save();
}
