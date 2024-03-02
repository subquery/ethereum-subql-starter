import { FeedConfirmedEvent } from "./types/contracts/FeedRegistry";
import { DataFeed } from "./types";
import { createDataFeedDatasource } from "./types";
import { EthereumLog } from "@subql/types-ethereum";
import assert from "assert";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function handleFeedConfirmed(
  event: EthereumLog<FeedConfirmedEvent["args"]>
): Promise<void> {
  assert(event.args);
  // Feed Confirmed event is emitted when a feed is added, updated, or removed
  let prevFeed = await DataFeed.get(event.args.previousAggregator);
  // if we haven't since this previous feed before, or the next feed is not the zero address, then this is a new feed and we need to create it
  if (prevFeed == null || event.args.latestAggregator != ZERO_ADDRESS) {
    let dataFeed = DataFeed.create({
      id: event.args.latestAggregator,
      assetAddress: event.args.asset,
      denominationAddress: event.args.denomination,
      timeCreated: event.block.timestamp,
      phaseId: event.args.nextPhaseId,
      live: true,
    });
    await dataFeed.save();

    await createDataFeedDatasource({
      address: event.args.latestAggregator,
    });
  } else if (prevFeed != null) {
    prevFeed.live = event.args.latestAggregator == ZERO_ADDRESS ? false : true;
    if (prevFeed.live == false) {
      prevFeed.timeDeprecated = event.block.timestamp;
    }
    prevFeed.save();
  }
}
