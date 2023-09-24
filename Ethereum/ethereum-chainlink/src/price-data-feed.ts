import { AnswerUpdatedEvent } from "./types/contracts/AccessControlledOffchainAggregator";
import { DataFeed, DataPoint } from "./types";
import { FeedRegistry__factory } from "./types/contracts/factories/FeedRegistry__factory";
import { EthereumLog } from "@subql/types-ethereum";

import { AccessControlledOffchainAggregator__factory } from "./types/contracts";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function handleAnswerUpdated(
  event: EthereumLog<AnswerUpdatedEvent["args"]>
): Promise<void> {
  const datasource = FeedRegistry__factory.connect(event.address, api);
  let dataFeed = await DataFeed.get(datasource.address);
  if (dataFeed) {
    // if info exists and name is null, then this is the first price for this feed so we can add the information.
    if (dataFeed.name == null && dataFeed.id !== ZERO_ADDRESS) {
      let contract = AccessControlledOffchainAggregator__factory.connect(
        event.address,
        api
      );
      let description = await contract.description();
      if (description) {
        dataFeed.name = description;
        let splitDescription = description.split("/");
        dataFeed.asset = splitDescription[0].trim();
        dataFeed.denomination = splitDescription[1].trim();
      }
      let decimals = await contract.decimals();
      if (decimals) {
        dataFeed.decimals = decimals;
      }
      dataFeed.timeLastPrice = event.block.timestamp;
      dataFeed.save();
    }
    let dataPointId = event.transaction.hash;
    let dataPoint = DataPoint.create({
      id: dataPointId,
      feedId: dataFeed.id,
      price: BigInt(event.args.current.toString()),
      roundId: BigInt(event.args.roundId.toString()),
      blockNumber: BigInt(event.block.number.toString()),
      blockTimestamp: BigInt(event.args.updatedAt.toString()),
    });
    dataPoint.save();
  }
}
