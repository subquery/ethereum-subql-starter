import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import { ERC165 } from "../types/contracts/ERC165";
import { NftMetadata } from "../types/contracts//NftMetadata";
import { AtomicMatch_Transaction } from "../types/abi-interfaces/OpenSeaV2";
import {
  Collection,
  CollectionDailySnapshot,
  Marketplace,
  MarketplaceDailySnapshot,
} from "../types/models";
import { NetworkConfigs } from "../configurations/configure";
import {
  NftStandard,
  BIGDECIMAL_ZERO,
  BIGDECIMAL_MAX,
  BIGINT_ZERO,
  NULL_ADDRESS,
  WETH_ADDRESS,
  MANTISSA_FACTOR,
  SECONDS_PER_DAY,
  ERC721_INTERFACE_IDENTIFIER,
  ERC1155_INTERFACE_IDENTIFIER,
} from "./constants";
import {
  DecodedTransferResult,
  calculateMatchPrice,
  decode_atomicize_Method,
  decode_nftTransfer_Method,
  getFunctionSelector,
  validateCallDataFunctionSelector,
} from "./utils";
import { Versions } from "./versions";
import { Network } from "../types";
import assert from "assert";

export async function getOrCreateMarketplace(
  marketplaceID: string
): Promise<Marketplace> {
  let marketplace = await Marketplace.get(marketplaceID);
  if (!marketplace) {
    marketplace = Marketplace.create({
      id: marketplaceID,
      name: NetworkConfigs.getProtocolName(),
      slug: NetworkConfigs.getProtocolSlug(),
      network: Network.MAINNET,
      collectionCount: 0,
      tradeCount: 0,
      cumulativeTradeVolumeETH: Number(BIGDECIMAL_ZERO),
      marketplaceRevenueETH: Number(BIGDECIMAL_ZERO),
      creatorRevenueETH: Number(BIGDECIMAL_ZERO),
      totalRevenueETH: Number(BIGDECIMAL_ZERO),
      cumulativeUniqueTraders: 0,
      schemaVersion: "test",
      subgraphVersion: "test",
      methodologyVersion: "test",
    });
  }

  marketplace.schemaVersion = Versions.getSchemaVersion();
  marketplace.subgraphVersion = Versions.getSubgraphVersion();
  marketplace.methodologyVersion = Versions.getMethodologyVersion();

  await marketplace.save();

  return marketplace;
}

export async function getOrCreateCollection(
  collectionID: string
): Promise<Collection> {
  let collection = await Collection.get(collectionID);
  if (!collection) {
    collection = Collection.create({
      id: collectionID,
      royaltyFee: Number(BIGDECIMAL_ZERO),
      cumulativeTradeVolumeETH: Number(BIGDECIMAL_ZERO),
      marketplaceRevenueETH: Number(BIGDECIMAL_ZERO),
      creatorRevenueETH: Number(BIGDECIMAL_ZERO),
      totalRevenueETH: Number(BIGDECIMAL_ZERO),
      tradeCount: 0,
      buyerCount: 0,
      sellerCount: 0,
      // TODO fix
      // nftStandard: getNftStandard(collectionID)
    });

    // const contract = NftMetadata.bind(Address.fromString(collectionID));

    // const nameResult = contract.try_name();
    // if (!nameResult.reverted) {
    //   collection.name = nameResult.value;
    // }
    // const symbolResult = contract.try_symbol();
    // if (!symbolResult.reverted) {
    //   collection.symbol = symbolResult.value;
    // }
    // const totalSupplyResult = contract.try_totalSupply();
    // if (!totalSupplyResult.reverted) {
    //   collection.totalSupply = totalSupplyResult.value;
    // }

    await collection.save();

    const marketplace = await getOrCreateMarketplace(
      NetworkConfigs.getMarketplaceAddress()
    );
    marketplace.collectionCount += 1;
    await marketplace.save();
  }
  return collection;
}

export async function getOrCreateMarketplaceDailySnapshot(
  timestamp: number
): Promise<MarketplaceDailySnapshot> {
  const snapshotID = (timestamp / SECONDS_PER_DAY).toString();

  let snapshot = await MarketplaceDailySnapshot.get(snapshotID);
  if (!snapshot) {
    snapshot = await MarketplaceDailySnapshot.create({
      id: snapshotID,
      marketplaceId: NetworkConfigs.getMarketplaceAddress(),
      // blockNumber: BigInt(0),
      // timestamp: BIGINT_ZERO,
      collectionCount: 0,
      cumulativeTradeVolumeETH: Number(BIGDECIMAL_ZERO),
      marketplaceRevenueETH: Number(BIGDECIMAL_ZERO),
      creatorRevenueETH: Number(BIGDECIMAL_ZERO),
      totalRevenueETH: Number(BIGDECIMAL_ZERO),
      tradeCount: 0,
      cumulativeUniqueTraders: 0,
      dailyTradedItemCount: 0,
      dailyActiveTraders: 0,
      dailyTradedCollectionCount: 0,
    });

    snapshot.save();
  }

  return snapshot;
}

export async function getOrCreateCollectionDailySnapshot(
  collection: string,
  timestamp: number
): Promise<CollectionDailySnapshot> {
  const snapshotID = collection
    .concat("-")
    .concat((timestamp / SECONDS_PER_DAY).toString());

  let snapshot = await CollectionDailySnapshot.get(snapshotID);
  if (!snapshot) {
    snapshot = CollectionDailySnapshot.create({
      id: snapshotID,
      collectionId: collection,
      // blockNumber: Number(BIGINT_ZERO),
      // timestamp: Number(BIGINT_ZERO),
      royaltyFee: Number(BIGDECIMAL_ZERO),
      dailyMinSalePrice: Number(BIGDECIMAL_MAX),
      dailyMaxSalePrice: Number(BIGDECIMAL_ZERO),
      cumulativeTradeVolumeETH: Number(BIGDECIMAL_ZERO),
      dailyTradeVolumeETH: Number(BIGDECIMAL_ZERO),
      marketplaceRevenueETH: Number(BIGDECIMAL_ZERO),
      creatorRevenueETH: Number(BIGDECIMAL_ZERO),
      totalRevenueETH: Number(BIGDECIMAL_ZERO),
      tradeCount: 0,
      dailyTradedItemCount: 0,
    });

    snapshot.save();
  }

  return snapshot;
}

// function getNftStandard(collectionID: string): string {
//   const erc165 = ERC165.bind(Address.fromString(collectionID));

//   const isERC721Result = erc165.try_supportsInterface(
//     Bytes.fromHexString(ERC721_INTERFACE_IDENTIFIER)
//   );
//   if (isERC721Result.reverted) {
//     log.warning("[getNftStandard] isERC721 reverted, collection ID: {}", [
//       collectionID,
//     ]);
//   } else {
//     if (isERC721Result.value) {
//       return NftStandard.ERC721;
//     }
//   }

//   const isERC1155Result = erc165.try_supportsInterface(
//     Bytes.fromHexString(ERC1155_INTERFACE_IDENTIFIER)
//   );
//   if (isERC1155Result.reverted) {
//     log.warning("[getNftStandard] isERC1155 reverted, collection ID: {}", [
//       collectionID,
//     ]);
//   } else {
//     if (isERC1155Result.value) {
//       return NftStandard.ERC1155;
//     }
//   }

//   return NftStandard.UNKNOWN;
// }

/**
 * Calculates trade/order price in BigDecimal
 * NOTE: currently ignores non-ETH/WETH trades
 */
export function calcTradePriceETH(
  call: AtomicMatch_Transaction,
  paymentToken: Address
): number {
  if (paymentToken == NULL_ADDRESS || paymentToken == WETH_ADDRESS) {
    const price = calculateMatchPrice(call);
    return price / Number(MANTISSA_FACTOR);
  } else {
    return Number(BIGDECIMAL_ZERO);
  }
}

export function decodeSingleNftData(
  call: AtomicMatch_Transaction,
  callData: Bytes
): DecodedTransferResult | null {
  assert(call.args, "No tx args");
  const sellTarget = call.args[0][11].toString();
  if (!validateCallDataFunctionSelector(callData)) {
    log.warning(
      "[checkCallDataFunctionSelector] returned false, Method ID: {}, transaction hash: {}, target: {}",
      [
        getFunctionSelector(callData),
        call.hash.toString(),
        sellTarget.toString(),
      ]
    );
    return null;
  } else {
    return decode_nftTransfer_Method(Address.fromString(sellTarget), callData);
  }
}

export function decodeBundleNftData(
  call: AtomicMatch_Transaction,
  callDatas: Bytes
): DecodedTransferResult[] {
  const decodedTransferResults: DecodedTransferResult[] = [];
  const decodedAtomicizeResult = decode_atomicize_Method(callDatas);
  for (let i = 0; i < decodedAtomicizeResult.targets.length; i++) {
    const target = decodedAtomicizeResult.targets[i];
    const calldata = decodedAtomicizeResult.callDatas[i];
    // Skip unrecognized method calls
    if (!validateCallDataFunctionSelector(calldata)) {
      log.warning(
        "[checkCallDataFunctionSelector] returned false in atomicize, Method ID: {}, transaction hash: {}, target: {}",
        [
          getFunctionSelector(calldata),
          call.hash.toString(),
          target.toHexString(),
        ]
      );
    } else {
      const singleNftTransferResult = decode_nftTransfer_Method(
        target,
        calldata
      );
      decodedTransferResults.push(singleNftTransferResult);
    }
  }
  return decodedTransferResults;
}
