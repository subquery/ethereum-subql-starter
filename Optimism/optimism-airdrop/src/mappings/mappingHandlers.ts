import { ClaimedLog } from "../types/abi-interfaces/AirdropAbi";
import assert from "assert";
import { Claim } from "../types/models/Claim";
import { DailyClaimSummary } from "../types/models/DailyClaimSummary";

async function checkGetDailyClaim(
  timestamp: bigint
): Promise<DailyClaimSummary> {
  // Create the ID from the iso date string (e.g. '2023-03-26')
  // Timestamps are in seconds, need to convert to ms
  const id = new Date(Number(timestamp) * 1000).toISOString().substring(0, 10);
  // Read to see if there is an existing aggregation record
  let dailyClaimSummary = await DailyClaimSummary.get(id);
  if (!dailyClaimSummary) {
    // This is a new day! Create a new aggregation
    dailyClaimSummary = DailyClaimSummary.create({
      id,
      total_claimed: BigInt(0),
    });
  }
  return dailyClaimSummary;
}

export async function handleClaim(log: ClaimedLog): Promise<void> {
  logger.info(`New claimed log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  // We make sure we have a daily claim aggregation to update
  const dailyClaimSummary = await checkGetDailyClaim(log.block.timestamp);

  const newClaim = Claim.create({
    id: log.args.index.toString(),
    account: log.args.account,
    transaction_hash: log.transactionHash,
    block_height: BigInt(log.blockNumber),
    block_timestamp: log.block.timestamp,
    value: log.args.amount.toBigInt(),
    daily_claim_summaryId: dailyClaimSummary.id,
  });

  // We update the daily aggregation
  dailyClaimSummary.total_claimed += newClaim.value;

  // Save data to the store
  await dailyClaimSummary.save();
  await newClaim.save();
}
