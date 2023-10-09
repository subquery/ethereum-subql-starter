import { Dividend, User } from "../types";
import { ClaimDividendBatchLog } from "../types/abi-interfaces/WinrStakingAbi";

async function checkGetUser(userID: string): Promise<User> {
  let user = await User.get(userID.toLowerCase());
  if (!user) {
    user = User.create({
      id: userID.toLowerCase(),
      totalRewards: BigInt(0),
    });
  }
  return user;
}

export async function handleDividendBatch(
  batchDividendLog: ClaimDividendBatchLog
): Promise<void> {
  if (batchDividendLog.args) {
    logger.info(`New dividend at block ${batchDividendLog.blockNumber}`);

    const user = await checkGetUser(batchDividendLog.args[0]);

    const dividend = Dividend.create({
      id: `${batchDividendLog.transactionHash}-${batchDividendLog.logIndex}`,
      blockHeight: BigInt(batchDividendLog.blockNumber),
      timestamp: batchDividendLog.block.timestamp,
      userId: user.id,
      reward: batchDividendLog.args[1].toBigInt(),
    });

    user.totalRewards += dividend.reward;

    await user.save();
    await dividend.save();
  }
}
