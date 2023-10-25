import {
  EventClaimLog,
  EventClaimBatchLog,
  EventClaimBatchCappedLog,
  EventClaimCappedLog,
  EventForgeLog,
} from "../types/abi-interfaces/SpaceStationV2";
import { createStarNFTDatasource } from "../types";
import { StarNFT, NFT, ClaimRecord } from "../types";
import {
  TWO_BI,
  ZERO_BI,
  EventModel,
  NFTModel,
  createSpaceStation,
  createCampaign,
} from "./helper";
import assert from "assert";

// handleClaimV2

async function handleClaimV2(
  event: EventModel,
  claim_nft: NFTModel,
  network: string
): Promise<void> {
  logger.info("Handling handleClaimV2");
  let campaign_id = claim_nft.campaignID;
  let user = claim_nft.user;
  let nft_contract = claim_nft.nftContract;
  logger.info(nft_contract);

  // logger.debug("campaign_id:, user: ", user);

  let starNFT = await StarNFT.get(nft_contract);
  logger.info("Checking starNFT");
  if (!starNFT) {
    // create template
    logger.info("Creating a template");
    logger.info(`nft_contract = ${nft_contract}`);
    createStarNFTDatasource({ nft_contract });
    starNFT = StarNFT.create({ id: nft_contract, network: network });
    starNFT.save();
  }
  logger.info(`StartNFT id - ${starNFT.id}`);
  assert(starNFT, "NFT not found");

  let spaceStation = await createSpaceStation(
    event.spaceStationAddr,
    TWO_BI,
    network
  );
  let campaign = await createCampaign(campaign_id.toString(), network);
  logger.info("Iterating through array");
  for (let i = 0; i < claim_nft.nftIDs.length; i++) {
    let nft_id = claim_nft.nftIDs[i];
    logger.info(`Iteration ${i}; nft_id ${nft_id}`);
    let verify_id = claim_nft.verifyIDs[i];
    logger.info(`Iteration ${i}; verify_id ${verify_id}`);
    let nft_model_id = nft_contract.concat("-").concat(nft_id.toString());
    logger.info(`Iteration ${i}; nft_model_id ${nft_model_id}`);
    // nft
    let nft = NFT.create({
      id: nft_model_id,
      number: BigInt(nft_id.toString()),
      starNFTId: starNFT.id,
      owner: user,
      campaignId: campaign.id,
      network: network,
    });

    nft.save();
    logger.info(`Saved NFT entity`);

    // claim record
    let claim = ClaimRecord.create({
      id: verify_id.toString(),
      spacestationId: spaceStation.id,
      verifyID: verify_id,
      cid: BigInt(campaign.id),
      user: user,
      tx: event.txHash,
      block: event.block,
      timestamp: event.timestamp,
      nftId: nft.id,
      network: network,
    });
    claim.save();
  }
}

// handleEventClaimV2

export async function handleEventClaimV2(
  event: EventClaimLog,
  network: string
): Promise<void> {
  logger.info("Handling EventClaimLogV2");
  let em = new EventModel();
  em.spaceStationAddr = event.address;
  em.block = BigInt(event.block.number);
  em.txHash = event.transaction.hash;
  em.logIndex = BigInt(event.logIndex);
  em.timestamp = event.block.timestamp;

  let nm = new NFTModel();
  assert(event.args, "No args in log");
  nm.campaignID = event.args._cid.toBigInt();
  nm.user = event.args._sender;
  nm.verifyIDs = [event.args._dummyId.toBigInt()];
  nm.nftIDs = [event.args._nftID.toBigInt()];
  nm.nftContract = event.args._starNFT;

  logger.info("--> V2 Claim {}", [event.address]);

  handleClaimV2(em, nm, network);
}

export async function handleEventClaimV2Ethereum(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimV2Ethereum");
  await handleEventClaimV2(event, "ethereum");
}

export async function handleEventClaimV2Arbitrum(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimV2Arbitrum");
  await handleEventClaimV2(event, "arbitrum");
}

export async function handleEventClaimV2Polygon(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimV2Polygon");
  await handleEventClaimV2(event, "polygon");
}

// handleEventClaimBatchV2

export async function handleEventClaimBatchV2(
  event: EventClaimBatchLog,
  network: string
): Promise<void> {
  logger.info("Handling handleEventClaimBatchV2");
  let em = new EventModel();
  em.spaceStationAddr = event.address;
  em.block = BigInt(event.block.number);
  em.txHash = event.transaction.hash;
  em.logIndex = BigInt(event.logIndex);
  em.timestamp = event.block.timestamp;

  let nm = new NFTModel();
  assert(event.args, "No args in log");
  nm.campaignID = event.args._cid.toBigInt();
  nm.user = event.args._sender;
  nm.verifyIDs = event.args._dummyIdArr.map((bigNumber) =>
    BigInt(bigNumber.toString())
  );
  nm.nftIDs = event.args._nftIDArr.map((bigNumber) =>
    BigInt(bigNumber.toString())
  );
  nm.nftContract = event.args._starNFT;

  logger.info("--> V2 ClaimBatch {}", [event.address]);

  handleClaimV2(em, nm, network);
}

export async function handleEventClaimBatchV2Ethereum(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchV2Ethereum");
  await handleEventClaimBatchV2(event, "ethereum");
}

export async function handleEventClaimBatchV2Arbitrum(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchV2Arbitrum");
  await handleEventClaimBatchV2(event, "arbitrum");
}

export async function handleEventClaimBatchV2Polygon(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchV2Polygon");
  await handleEventClaimBatchV2(event, "polygon");
}

// handleEventClaimBatchCappedV2

export async function handleEventClaimBatchCappedV2(
  event: EventClaimBatchCappedLog,
  network: string
): Promise<void> {
  logger.info("Hanling EventClaimBatchCappedLogV2");
  let em = new EventModel();
  em.spaceStationAddr = event.address;
  em.block = BigInt(event.block.number);
  em.txHash = event.transaction.hash;
  em.logIndex = BigInt(event.logIndex);
  em.timestamp = event.block.timestamp;

  let nm = new NFTModel();
  assert(event.args, "No args in log");
  nm.campaignID = event.args._cid.toBigInt();
  nm.user = event.args._sender;
  nm.verifyIDs = event.args._dummyIdArr.map((bigNumber) =>
    BigInt(bigNumber.toString())
  );
  nm.nftIDs = event.args._nftIDArr.map((bigNumber) =>
    BigInt(bigNumber.toString())
  );
  nm.nftContract = event.args._starNFT;

  logger.info("--> V2 ClaimBatchCapped {}", [event.address]);

  handleClaimV2(em, nm, network);
}

export async function handleEventClaimBatchCappedV2Ethereum(
  event: EventClaimBatchCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchCappedV2Ethereum");
  await handleEventClaimBatchCappedV2(event, "ethereum");
}

export async function handleEventClaimBatchCappedV2Arbitrum(
  event: EventClaimBatchCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchCappedV2Arbitrum");
  await handleEventClaimBatchCappedV2(event, "arbitrum");
}

export async function handleEventClaimBatchCappedV2Polygon(
  event: EventClaimBatchCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchCappedV2Polygon");
  await handleEventClaimBatchCappedV2(event, "polygon");
}

// handleEventClaimCappedV2

export async function handleEventClaimCappedV2(
  event: EventClaimCappedLog,
  network: string
): Promise<void> {
  logger.info("Hanling EventClaimCappedLogV2");
  let em = new EventModel();
  em.spaceStationAddr = event.address;
  em.block = BigInt(event.block.number);
  em.txHash = event.transaction.hash;
  em.logIndex = BigInt(event.logIndex);
  em.timestamp = event.block.timestamp;

  let nm = new NFTModel();
  assert(event.args, "No args in log");
  nm.campaignID = event.args._cid.toBigInt();
  nm.user = event.args._sender;
  nm.verifyIDs = [event.args._dummyId.toBigInt()];
  nm.nftIDs = [event.args._nftID.toBigInt()];
  nm.nftContract = event.args._starNFT;

  logger.info("--> V2 ClaimCapped {}", [event.address]);

  handleClaimV2(em, nm, network);
}

export async function handleEventClaimCappedV2Ethereum(
  event: EventClaimCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimCappedV2Ethereum");
  await handleEventClaimCappedV2(event, "ethereum");
}

export async function handleEventClaimCappedV2Arbitrum(
  event: EventClaimCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimCappedV2Arbitrum");
  await handleEventClaimCappedV2(event, "arbitrum");
}

export async function handleEventClaimCappedV2Polygon(
  event: EventClaimCappedLog
): Promise<void> {
  logger.info("Handling handleEventClaimCappedV2Polygon");
  await handleEventClaimCappedV2(event, "polygon");
}

// handleEventForgeV2

export async function handleEventForgeV2(
  event: EventForgeLog,
  network: string
): Promise<void> {
  logger.info("Handling EventForgeLogV2");
  let em = new EventModel();
  em.spaceStationAddr = event.address;
  em.block = BigInt(event.block.number);
  em.txHash = event.transaction.hash;
  em.logIndex = BigInt(event.logIndex);
  em.timestamp = event.block.timestamp;

  let nm = new NFTModel();
  assert(event.args, "No args in log");
  nm.campaignID = event.args._cid.toBigInt();
  nm.user = event.args._sender;
  nm.verifyIDs = [event.args._dummyId.toBigInt()];
  nm.nftIDs = [event.args._nftID.toBigInt()];
  nm.nftContract = event.args._starNFT;

  logger.info("--> V2 Forge {}", [event.address]);

  handleClaimV2(em, nm, network);
}

export async function handleEventForgeV2Ethereum(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgeV2Ethereum");
  await handleEventForgeV2(event, "ethereum");
}

export async function handleEventForgeV2Arbitrum(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgeV2Arbitrum");
  await handleEventForgeV2(event, "arbitrum");
}

export async function handleEventForgeV2Polygon(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgeV2Polygon");
  await handleEventForgeV2(event, "polygon");
}
