import { Claim, DailyAggregation } from "../types";
import { TokensClaimedLog } from "../types/abi-interfaces/Erc721baseAbi";
import assert from "assert";

export async function handleNftClaim(log: TokensClaimedLog): Promise<void> {
  logger.info(`New claim log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  let date = new Date(Number(log.block.timestamp) * 1000);

  const claim = Claim.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    timestamp: date,
    claimer: log.args.claimer,
    receiver: log.args.receiver,
    tokenId: log.args.startTokenId.toBigInt(),
    quantity: log.args.quantityClaimed.toBigInt(),
  });

  await handleDailyAggregation(date, claim.quantity);

  await claim.save();
}

export async function handleDailyAggregation(
  date: Date,
  quantity: bigint
): Promise<void> {
  const id = date.toISOString().slice(0, 10);
  let aggregation = await DailyAggregation.get(id);
  logger.info(`New daily aggregation at ${id}`);

  if (!aggregation) {
    aggregation = DailyAggregation.create({
      id,
      totalQuantity: BigInt(0),
    });
  }

  aggregation.totalQuantity = aggregation.totalQuantity + quantity;

  await aggregation.save();
}

/*export async function handleTransaction(tx: ApproveTransaction): Promise<void> {
  logger.info(`New Approval transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  const approval = Approval.create({
    id: tx.hash,
    owner: tx.from,
    spender: await tx.args[0],
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to || "",
  });

  await approval.save();
}*/
