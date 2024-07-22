import { FlareLog } from "@subql/types-flare";
import { BigNumber } from "@ethersproject/bignumber";
import { Address, Reward } from "../types";

type RewardClaimedLogArgs = [string, string, string, BigNumber, BigNumber] & {
  dataProvider: string;
  whoClaimed: string;
  sentTo: string;
  rewardEpoch: BigNumber;
  amount: BigNumber;
};

export async function handleLog(
  event: FlareLog<RewardClaimedLogArgs>
): Promise<void> {
  // See example log in this transaction https://songbird-explorer.flare.network/tx/0xd832d0283f56acbda902066dd47147f510a68fd923296a2162cffcf10c15d8f8/logs
  // logger.info("flare Event");

  // Ensure that our account entities exist
  const whoClaimed = await Address.get(event.args.whoClaimed.toLowerCase());
  if (!whoClaimed) {
    // Does not exist, create new
    await Address.create({
      id: event.args.whoClaimed.toLowerCase(),
    }).save();
  }

  const whoRecieved = await Address.get(event.args.sentTo.toLowerCase());
  if (!whoRecieved) {
    // Does not exist, create new
    await Address.create({
      id: event.args.sentTo.toLowerCase(),
    }).save();
  }

  // Create the new Reward entity
  const reward = Reward.create({
    id: event.transactionHash,
    recipientId: event.args.sentTo.toLowerCase(),
    dataProvider: event.args.dataProvider,
    whoClaimedId: event.args.whoClaimed.toLowerCase(),
    rewardEpoch: event.args.rewardEpoch.toBigInt(),
    amount: event.args.amount.toBigInt(),
  });

  await reward.save();
}
