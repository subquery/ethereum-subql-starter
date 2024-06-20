import { NFTCreatedLog } from "../types/abi-interfaces/StarNFTFactory";
import { createStarNFTDatasource } from "../types";
import { StarNFT, StarNFTFactory } from "../types";
import assert from "assert";

export async function handleStarNFTCreated(
  event: NFTCreatedLog,
  network: string,
): Promise<void> {
  assert(event.args, "No event args found");
  logger.info("--> New StarNFT Created: {}", [event.args.starAddr]);

  let factory = await StarNFTFactory.get(event.address);
  if (!factory) {
    factory = StarNFTFactory.create({
      id: event.address,
      starNFTs: new Array<string>(),
      network: network,
    });
  }

  let nft_contract = event.args.starAddr;
  let nft = StarNFT.create({ id: nft_contract, network: network });
  nft.save();

  factory.starNFTs.push(nft_contract);
  factory.save();

  createStarNFTDatasource({ nft_contract });
}

export async function handleStarNFTCreatedEthereum(
  event: NFTCreatedLog,
): Promise<void> {
  logger.info("Handling handleStarNFTCreatedEthereum");
  await handleStarNFTCreated(event, "ethereum");
}

export async function handleStarNFTCreatedArbitrum(
  event: NFTCreatedLog,
): Promise<void> {
  logger.info("Handling handleStarNFTCreatedArbitrum");
  await handleStarNFTCreated(event, "arbitrum");
}

export async function handleStarNFTCreatedPolygon(
  event: NFTCreatedLog,
): Promise<void> {
  logger.info("Handling handleStarNFTCreatedPolygon");
  await handleStarNFTCreated(event, "polygon");
}
