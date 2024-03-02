import { SpaceStation, StarNFT, Campaign } from "../types";

export class EventModel {
  spaceStationAddr: string = "";
  txHash: string = "";
  block: bigint = BigInt(0);
  logIndex: bigint = BigInt(0);
  timestamp: bigint = BigInt(0);
  constructor() {}
}

export class NFTModel {
  campaignID: bigint = BigInt(0);
  user: string = "";
  verifyIDs: Array<bigint> = [];
  nftIDs: Array<bigint> = [];
  nftContract: string = "";
  constructor() {}
}

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export let ZERO_BI = BigInt(0);
export let ONE_BI = BigInt(1);
export let TWO_BI = BigInt(2);
export let ZERO_BD = Number(0);
export let ONE_BD = Number(1);
export let BI_18 = BigInt(18);

export function exponentToBigDecimal(decimals: BigInt): Number {
  let bd = Number(1);
  // for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
  //   bd = bd.times(BigDecimal.fromString("10"));
  // }
  return bd;
}

export function bigDecimalExp18(): Number {
  return Number("1000000000000000000");
}

// export function convertEthToDecimal(eth: BigInt): Number {
//   return eth.toBigDecimal().div(ONE_BD);
// }

// model functions

export async function createSpaceStation(
  address: string,
  version: bigint,
  network: string
): Promise<SpaceStation> {
  let sss = await SpaceStation.get(address);
  if (!sss) {
    sss = SpaceStation.create({
      id: address,
      version: version,
      network: network,
    });
    sss.save();
  }
  return sss as SpaceStation;
}

export async function createStarNFT(
  address: string,
  network: string
): Promise<StarNFT> {
  let snf = await StarNFT.get(address);
  if (!snf) {
    snf = StarNFT.create({ id: address, network: network });
    snf.save();
  }
  return snf as StarNFT;
}

export async function createCampaign(
  cid: string,
  network: string
): Promise<Campaign> {
  let campaign = await Campaign.get(cid);
  if (!campaign) {
    campaign = Campaign.create({ id: cid, network: network });
    // campaign.cap = ZERO_BI;
    campaign.save();
  }
  return campaign as Campaign;
}
