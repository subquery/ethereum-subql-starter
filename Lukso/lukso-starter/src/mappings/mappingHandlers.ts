import { Transfer } from "../types";
import { TransferLog } from "../types/abi-interfaces/Lsp7Abi";
import assert from "assert";

export async function handleLog(log: TransferLog): Promise<void> {
  logger.info(`New transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = Transfer.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    to: log.args.to,
    from: log.args.from,
    amount: log.args.amount.toBigInt(),
    contractAddress: log.address,
    operator: log.args.operator,
    force: log.args.force,
    data: log.args.data,
  });

  await transaction.save();
}
