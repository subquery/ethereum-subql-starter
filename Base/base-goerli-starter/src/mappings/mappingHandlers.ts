import assert from "assert";
import { DripTransaction } from "../types/abi-interfaces/FaucetAbi";

export async function handleTransaction(tx: DripTransaction): Promise<void> {
  logger.info(`New Drip transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");
  const approval = Approval.create({
    id: tx.hash,
    blockHeight: tx.blockNumber.toString(),
    owner: tx.from,
    spender: await tx.args[0],
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to,
  });

  await approval.save();
}
