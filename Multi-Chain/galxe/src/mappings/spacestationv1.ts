import {
  EventClaimLog,
  EventClaimBatchLog,
  EventForgeLog,
} from "../types/abi-interfaces/SpaceStationV1";

import { createStarNFTDatasource } from "../types";

// import { StarNFT as StarNFTTemplate } from "../generated/templates";
import { StarNFT, NFT, NFTMintTransaction, ClaimRecord } from "../types";
import {
  ONE_BI,
  ZERO_BI,
  EventModel,
  NFTModel,
  createSpaceStation,
  createCampaign,
} from "./helper";
import assert from "assert";

async function handleClaim(
  event: EventModel,
  claim_nft: NFTModel,
  network: string
): Promise<void> {
  logger.info("Handling Claim");
  let campaign_id = claim_nft.campaignID;
  let user = claim_nft.user;

  let mintTx = await NFTMintTransaction.get(event.txHash);
  if (!mintTx) {
    logger.info("MintTx Not Found campaign: {} user: {} tx: {}", [
      campaign_id.toString(),
      user,
      event.txHash,
    ]);
    return;
  }
  let nft_contract = mintTx.nftContract;

  let starNFT = await StarNFT.get(nft_contract);
  if (!starNFT) {
    // create template
    createStarNFTDatasource({ nft_contract });
    starNFT = StarNFT.create({ id: nft_contract, network: network });
    starNFT.save();
  }
  assert(starNFT, "starNFT is null");
  let spaceStation = createSpaceStation(
    event.spaceStationAddr,
    ONE_BI,
    network
  );
  let campaign = await createCampaign(campaign_id.toString(), network);

  for (let i = 0; i < claim_nft.nftIDs.length; i++) {
    let nft_id = claim_nft.nftIDs[i];
    let verify_id = claim_nft.verifyIDs[i];
    let nft_model_id = nft_contract.concat("-").concat(nft_id.toString());
    // nft
    let nft = NFT.create({
      id: nft_model_id,
      number: BigInt(nft_id.toString()),
      starNFTId: starNFT?.id.toString(),
      owner: user,
      campaignId: campaign.id,
      network: network,
    });

    nft.save();

    // claim record
    let claim = ClaimRecord.create({
      id: verify_id.toString(),
      nftId: nft.id,
      spacestationId: (await spaceStation).id,
      verifyID: BigInt(verify_id.toString()),
      cid: BigInt(campaign_id.toString()),
      user: user,
      tx: event.txHash,
      block: event.block,
      timestamp: event.timestamp,
      network: network,
    });
    claim.save();
  }
}

// handleEventClaim

export async function handleEventClaim(
  event: EventClaimLog,
  network: string
): Promise<void> {
  logger.info("Handling EventClaimLog");
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

  logger.info("--> V1 Claim {}", [event.address]);

  handleClaim(em, nm, network);
}

export async function handleEventClaimEthereum(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimEthereum");
  await handleEventClaim(event, "ethereum");
}

export async function handleEventClaimArbitrum(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimArbitrum");
  await handleEventClaim(event, "arbitrum");
}

export async function handleEventClaimPolygon(
  event: EventClaimLog
): Promise<void> {
  logger.info("Handling handleEventClaimPolygon");
  await handleEventClaim(event, "polygon");
}

// handleEventClaimBatch

export async function handleEventClaimBatch(
  event: EventClaimBatchLog,
  network: string
): Promise<void> {
  logger.info("Handling EventClaimBatchLog");
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

  logger.info("--> V1 ClaimBatch {}", [event.address]);

  handleClaim(em, nm, network);
}

export async function handleEventClaimBatchEthereum(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchEthereum");
  await handleEventClaimBatch(event, "ethereum");
}

export async function handleEventClaimBatchArbitrum(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchArbitrum");
  await handleEventClaimBatch(event, "arbitrum");
}

export async function handleEventClaimBatchPolygon(
  event: EventClaimBatchLog
): Promise<void> {
  logger.info("Handling handleEventClaimBatchPolygon");
  await handleEventClaimBatch(event, "polygon");
}

// handleEventForge

export async function handleEventForge(
  event: EventForgeLog,
  network: string
): Promise<void> {
  logger.info("Handling EventForgeLog");
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

  logger.info("--> V1 Forge {}", [event.address]);

  handleClaim(em, nm, network);
}

export async function handleEventForgeEthereum(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgeEthereum");
  await handleEventForge(event, "ethereum");
}

export async function handleEventForgeArbitrum(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgeArbitrum");
  await handleEventForge(event, "arbitrum");
}

export async function handleEventForgePolygon(
  event: EventForgeLog
): Promise<void> {
  logger.info("Handling handleEventForgePolygon");
  await handleEventForge(event, "polygon");
}
