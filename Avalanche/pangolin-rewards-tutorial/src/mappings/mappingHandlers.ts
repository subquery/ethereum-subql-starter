import { PangolinRewards, User } from "../types";
import { RewardPaidLog } from "../types/abi-interfaces/PangolinRewards";

async function checkGetUser(id: string): Promise<User> {
  let user = await User.get(id.toLowerCase());
  if (!user) {
    // does not exist, create a new user
    user = User.create({
      id: id.toLowerCase(),
      totalRewards: BigInt(0),
    });
  }
  return user;
}

export async function handleLog(event: RewardPaidLog): Promise<void> {
  logger.info(`New Reward Paid at block ${event.blockNumber}`);
  const { args } = event;
  if (args) {
    const user = await checkGetUser(args.user);

    const pangolinRewardRecord = PangolinRewards.create({
      id: `${event.blockHash}-${event.logIndex}`,
      transactionHash: event.transactionHash,
      blockHash: event.blockHash,
      blockNumber: BigInt(event.blockNumber),
      receiverId: user.id,
      amount: BigInt(args.reward.toString()),
    });

    user.totalRewards += pangolinRewardRecord.amount;
    await user.save();
    await pangolinRewardRecord.save();
  }
}
