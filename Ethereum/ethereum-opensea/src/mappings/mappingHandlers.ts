import { AtomicMatch_Transaction } from "../types/abi-interfaces/OpenSeaV2";
import assert from "assert";

import { Trade, _Item } from "../types";
import { NetworkConfigs } from "../configurations/configure";
import {
  BIGDECIMAL_HUNDRED,
  BIGDECIMAL_ZERO,
  EXCHANGE_MARKETPLACE_FEE,
  INVERSE_BASIS_POINT,
  NULL_ADDRESS,
  SaleStrategy,
  SECONDS_PER_DAY,
  WYVERN_ATOMICIZER_ADDRESS,
} from "./constants";
import {
  calcTradePriceETH,
  decodeSingleNftData,
  decodeBundleNftData,
  getOrCreateCollection,
  getOrCreateCollectionDailySnapshot,
  getOrCreateMarketplace,
  getOrCreateMarketplaceDailySnapshot,
} from "./helpers";
import { getSaleStrategy, guardedArrayReplace, min, max } from "./utils";
import { Address, Bytes } from "@graphprotocol/graph-ts";

/**
 * Order struct as found in the Project Wyvern official source
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/ExchangeCore.sol#L92
 */
// struct Order {
//   /* Exchange address, intended as a versioning mechanism. */
//   address exchange;
//   /* Order maker address. */
//   address maker;
//   /* Order taker address, if specified. */
//   address taker;
//   /* Maker relayer fee of the order, unused for taker order. */
//   uint makerRelayerFee;
//   /* Taker relayer fee of the order, or maximum taker fee for a taker order. */
//   uint takerRelayerFee;
//   /* Maker protocol fee of the order, unused for taker order. */
//   uint makerProtocolFee;
//   /* Taker protocol fee of the order, or maximum taker fee for a taker order. */
//   uint takerProtocolFee;
//   /* Order fee recipient or zero address for taker order. */
//   address feeRecipient;
//   /* Fee method (protocol token or split fee). */
//   FeeMethod feeMethod;
//   /* Side (buy/sell). */
//   SaleKindInterface.Side side;
//   /* Kind of sale. */
//   SaleKindInterface.SaleKind saleKind;
//   /* Target. */
//   address target;
//   /* HowToCall. */
//   AuthenticatedProxy.HowToCall howToCall;
//   /* Calldata. */
//   bytes calldata;
//   /* Calldata replacement pattern, or an empty byte array for no replacement. */
//   bytes replacementPattern;
//   /* Static call target, zero-address for no static call. */
//   address staticTarget;
//   /* Static call extra data. */
//   bytes staticExtradata;
//   /* Token used to pay for the order, or the zero-address as a sentinel value for Ether. */
//   address paymentToken;
//   /* Base price of the order (in paymentTokens). */
//   uint basePrice;
//   /* Auction extra parameter - minimum bid increment for English auctions, starting/ending price difference. */
//   uint extra;
//   /* Listing timestamp. */
//   uint listingTime;
//   /* Expiration timestamp - 0 for no expiry. */
//   uint expirationTime;
//   /* Order salt, used to prevent duplicate hashes. */
//   uint salt;
//   /* NOTE: uint nonce is an additional component of the order but is read from storage */
// }

/**
 * atomicMatch method signature as found in the Project Wyvern official source
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/ExchangeCore.sol#L665
 *
 * atomicMatch(Order memory buy, Sig memory buySig, Order memory sell, Sig memory sellSig, bytes32 metadata)
 *
 * atomicMatch parameters matched with labels of call inputs
 * https://github.com/ProjectWyvern/wyvern-ethereum/blob/bfca101b2407e4938398fccd8d1c485394db7e01/contracts/exchange/Exchange.sol#L333
 *
 * - buy: Order(addrs[0] exchange, addrs[1] maker, addrs[2] taker, uints[0] makerRelayerFee, uints[1] takerRelayerFee, uints[2] makerProtocolFee, uints[3] takerProtocolFee, addrs[3] feeRecipient, FeeMethod(feeMethodsSidesKindsHowToCalls[0]) feeMethod, SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[1]) side, SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[2]) sideKind, addrs[4] target, AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[3]) howToCall, calldataBuy calldata, replacementPatternBuy replacementPattern, addrs[5] staticTarget, staticExtradataBuy staticExtradata, ERC20(addrs[6]) paymentToken, uints[4] basePrice, uints[5] extra, uints[6] listingTime, uints[7] expirationTime, uints[8] salt),
 * - buySig: Sig(vs[0], rssMetadata[0], rssMetadata[1]),
 * - sell: Order(addrs[7] exchange, addrs[8] maker, addrs[9] taker, uints[9] makerRelayerFee, uints[10] takerRelayerFee, uints[11] makerProtocolFee, uints[12] takerProtocolFee, addrs[10] feeRecipient, FeeMethod(feeMethodsSidesKindsHowToCalls[4]) feeMethod, SaleKindInterface.Side(feeMethodsSidesKindsHowToCalls[5]) side, SaleKindInterface.SaleKind(feeMethodsSidesKindsHowToCalls[6]) sideKind, addrs[11] target, AuthenticatedProxy.HowToCall(feeMethodsSidesKindsHowToCalls[7]) howToCall, calldataSell calldata, replacementPatternSell replacementPattern, addrs[12] staticTarget, staticExtradataSell staticExtradata, ERC20(addrs[13]) paymentToken, uints[13] basePrice, uints[14] extra, uints[15] listingTime, uints[16] expirationTime, uints[17] salt),
 * - sellSig: Sig(vs[1], rssMetadata[2], rssMetadata[3]),
 * - metadata: rssMetadata[4]
 *
 * Lookup table for addrs[14]
 * - addrs[0] buy.exchange
 * - addrs[1] buy.maker
 * - addrs[2] buy.taker
 * - addrs[3] buy.feeRecipient
 * - addrs[4] buy.target
 * - addrs[5] buy.staticTarget
 * - addrs[6] buy.paymentToken
 * - addrs[7] sell.exchange
 * - addrs[8] sell.maker
 * - addrs[9] sell.taker
 * - addrs[10] sell.feeRecipient
 * - addrs[11] sell.target
 * - addrs[12] sell.staticTarget
 * - addrs[13] sell.paymentToken
 *
 * Lookup table for uints[18]
 * - uints[0] buy.makerRelayerFee
 * - uints[1] buy.takerRelayerFee
 * - uints[2] buy.makerProtocolFee
 * - uints[3] buy.takerProtocolFee
 * - uints[4] buy.basePrice
 * - uints[5] buy.extra
 * - uints[6] buy.listingTime
 * - uints[7] buy.expirationTime
 * - uints[8] buy.salt
 * - uints[9] sell.makerRelayerFee
 * - uints[10] sell.takerRelayerFee
 * - uints[11] sell.makerProtocolFee
 * - uints[12] sell.takerProtocolFee
 * - uints[13] sell.basePrice
 * - uints[14] sell.extra
 * - uints[15] sell.listingTime
 * - uints[16] sell.expirationTime
 * - uints[17] sell.salt
 *
 * Lookup table for feeMethodsSidesKindsHowToCalls[8]
 * - feeMethodsSidesKindsHowToCalls[0] buy.feeMethod
 * - feeMethodsSidesKindsHowToCalls[1] buy.side
 * - feeMethodsSidesKindsHowToCalls[2] buy.saleKind
 * - feeMethodsSidesKindsHowToCalls[3] buy.howToCall
 * - feeMethodsSidesKindsHowToCalls[4] sell.feeMethod
 * - feeMethodsSidesKindsHowToCalls[5] sell.side
 * - feeMethodsSidesKindsHowToCalls[6] sell.saleKind
 * - feeMethodsSidesKindsHowToCalls[7] sell.howToCall
 */

export async function handleMatch(
  call: AtomicMatch_Transaction
): Promise<void> {
  // sellTarget is sell.target (addrs[11])
  assert(call.args, "No call args");
  let sellTarget = call.args[0][11];
  if (sellTarget.toString() == WYVERN_ATOMICIZER_ADDRESS.toString()) {
    handleBundleSale(call);
  } else {
    handleSingleSale(call);
  }
}

async function handleSingleSale(call: AtomicMatch_Transaction): Promise<void> {
  assert(call.args);
  let dailyTradedItems = 0;
  let collectionAddrs: string[] = [];

  // paymentToken is buyOrder.paymentToken or SellOrder.payment token (addrs[6] or addrs[13])
  let paymentToken = await call.args[0][13];

  let mergedCallData = guardedArrayReplace(
    Bytes.fromHexString(await call.args[3].toString()),
    Bytes.fromHexString(await call.args[4].toString()),
    Bytes.fromHexString(await call.args[5].toString())
  );

  let decodedTransferResult = decodeSingleNftData(call, mergedCallData);
  if (!decodedTransferResult) {
    return;
  }

  let buyer = decodedTransferResult.to.toHexString();
  let seller = decodedTransferResult.from.toHexString();
  let collectionAddr = decodedTransferResult.token.toHexString();
  let tokenId = decodedTransferResult.tokenId;
  let amount = decodedTransferResult.amount;
  let saleKind = Number(await call.args[2][6]);
  let strategy = getSaleStrategy(saleKind);
  let priceETH = calcTradePriceETH(call, Address.fromString(paymentToken));

  collectionAddrs.push(collectionAddr);

  if (buyer != call.args[0][1].toString()) {
    logger.warn(
      "buyMaker/receiver do not match, isBundle: {}, buyMaker: {}, reciever: {}, tx: {}",
      [
        false.toString(),
        call.args[0][1].toString(),
        buyer,
        call.hash.toString(),
      ]
    );
  }

  if (seller != call.args[0][8].toString()) {
    logger.warn(
      "sellMaker/sender do not match, isBundle: {}, sellMaker: {}, sender: {}, tx: {}",
      [
        false.toString(),
        call.args[0][8].toString(),
        seller,
        call.hash.toString(),
      ]
    );
  }

  // No event log index since this is a contract call
  let tradeID = call.hash
    .toString()
    .concat("-")
    .concat(decodedTransferResult.method)
    .concat("-")
    .concat(tokenId.toString());
  let trade = Trade.create({
    id: tradeID,
    transactionHash: call.hash.toString(),
    // timestamp: call.blockTimestamp,
    // blockNumber = call.block.number,
    isBundle: false,
    collectionId: collectionAddr,
    tokenId: BigInt(tokenId.toString()),
    priceETH: priceETH,
    amount: BigInt(amount.toString()),
    // strategy: strategy,
    buyer: buyer,
    seller: seller,
  });

  await trade.save();

  // Prepare for updating dailyTradedItemCount
  let newDailyTradedItem = false;
  let dailyTradedItemID = "DAILY_TRADED_ITEM-"
    .concat(collectionAddr)
    .concat("-")
    .concat(tokenId.toString())
    .concat("-")
    .concat((Number(call.blockTimestamp) / SECONDS_PER_DAY).toString());
  let dailyTradedItem = await _Item.get(dailyTradedItemID);
  if (!dailyTradedItem) {
    dailyTradedItem = new _Item(dailyTradedItemID);
    dailyTradedItem.save();
    newDailyTradedItem = true;
    dailyTradedItems += 1;
  }

  // Update Collection and daily snapshot
  updateCollectionMetrics(
    call,
    collectionAddr,
    buyer,
    seller,
    priceETH,
    newDailyTradedItem,
    trade.isBundle
  );

  // Update Marketplace and daily snapshot
  updateMarketplaceMetrics(
    call,
    collectionAddrs,
    buyer,
    seller,
    priceETH,
    dailyTradedItems
  );
}

async function handleBundleSale(call: AtomicMatch_Transaction): Promise<void> {
  assert(call.args);
  let dailyTradedItems = 0;
  let collectionAddrs: string[] = [];

  // buyer is buyOrder.maker (addrs[1])
  let buyer = call.args[0][1].toString();
  // seller is sellOrder.maker (addrs[8])
  let seller = call.args[0][8].toString();
  // paymentToken is buyOrder.paymentToken or SellOrder.payment token (addrs[6] or addrs[13])
  let paymentToken = call.args[0][13];

  let bundlePriceETH = calcTradePriceETH(
    call,
    Address.fromString(paymentToken.toString())
  );

  let mergedCallData = guardedArrayReplace(
    Bytes.fromHexString(await call.args[3].toString()),
    Bytes.fromHexString(await call.args[4].toString()),
    Bytes.fromHexString(await call.args[5].toString())
  );

  let decodedTransferResults = decodeBundleNftData(call, mergedCallData);
  let tradeSize = Number(decodedTransferResults.length);
  for (let i = 0; i < decodedTransferResults.length; i++) {
    let collectionAddr = decodedTransferResults[i].token.toHexString();
    let tokenId = decodedTransferResults[i].tokenId;
    let amount = decodedTransferResults[i].amount;
    let saleKind = await call.args[2][6];
    let strategy = getSaleStrategy(Number(saleKind));
    // Average price of token in bundle
    let avgTradePriceETH = bundlePriceETH / tradeSize;

    collectionAddrs.push(collectionAddr);

    if (strategy == SaleStrategy.DUTCH_AUCTION) {
      logger.warn("dutch auction sale in a bundle sale, transaction: {}", [
        call.hash.toString(),
      ]);
    }

    if (buyer != decodedTransferResults[i].to.toHexString()) {
      logger.warn(
        "buyMaker/receiver do not match, isBundle: {}, buyMaker: {}, reciever: {}, tx: {}",
        [
          true.toString(),
          buyer,
          decodedTransferResults[i].to.toHexString(),
          call.hash.toString(),
        ]
      );
    }

    if (seller != decodedTransferResults[i].from.toHexString()) {
      logger.warning(
        "sellMaker/sender do not match, isBundle: {}, sellMaker: {}, sender: {}, tx: {}",
        [
          true.toString(),
          seller,
          decodedTransferResults[i].from.toHexString(),
          call.hash.toString(),
        ]
      );
    }

    // No event log index since this is a contract call
    let tradeID = call.hash
      .toString()
      .concat("-")
      .concat(decodedTransferResults[i].method)
      .concat("-")
      .concat(tokenId.toString());
    let trade = Trade.create({
      id: tradeID,
      transactionHash: call.hash.toString(),
      // timestamp: call.timestamp,
      // blockNumber: call.block.number,
      isBundle: true,
      collectionId: collectionAddr,
      tokenId: BigInt(tokenId.toString()),
      priceETH: avgTradePriceETH,
      amount: BigInt(amount.toString()),
      // strategy: strategy,
      buyer: buyer,
      seller: seller,
    });

    trade.save();

    // Prepare for updating dailyTradedItemCount
    let newDailyTradedItem = false;
    let dailyTradedItemID = "DAILY_TRADED_ITEM-"
      .concat(collectionAddr)
      .concat("-")
      .concat(tokenId.toString())
      .concat("-")
      .concat((Number(call.blockTimestamp) / SECONDS_PER_DAY).toString());
    let dailyTradedItem = await _Item.get(dailyTradedItemID);
    if (!dailyTradedItem) {
      dailyTradedItem = _Item.create({ id: dailyTradedItemID });
      dailyTradedItem.save();
      newDailyTradedItem = true;
      dailyTradedItems += 1;
    }

    // Update Collection and daily snapshot
    updateCollectionMetrics(
      call,
      collectionAddr,
      buyer,
      seller,
      avgTradePriceETH,
      newDailyTradedItem,
      trade.isBundle
    );
  }

  // Update Marketplace and daily snapshot
  updateMarketplaceMetrics(
    call,
    collectionAddrs,
    buyer,
    seller,
    bundlePriceETH,
    dailyTradedItems
  );
}

async function updateCollectionMetrics(
  call: AtomicMatch_Transaction,
  collectionAddr: string,
  buyer: string,
  seller: string,
  priceETH: number,
  newDailyTradedItem: boolean,
  isBundle: boolean
): Promise<void> {
  let collection = await getOrCreateCollection(collectionAddr);
  collection.tradeCount += 1;

  let buyerCollectionAccountID = "COLLECTION_ACCOUNT-BUYER-"
    .concat(collection.id)
    .concat("-")
    .concat(buyer);
  let buyerCollectionAccount = await _Item.get(buyerCollectionAccountID);
  if (!buyerCollectionAccount) {
    buyerCollectionAccount = _Item.create({ id: buyerCollectionAccountID });
    buyerCollectionAccount.save();
    collection.buyerCount += 1;
  }

  let sellerCollectionAccountID = "COLLECTION_ACCOUNT-SELLER-"
    .concat(collection.id)
    .concat("-")
    .concat(seller);
  let sellerCollectionAccount = await _Item.get(sellerCollectionAccountID);
  if (!sellerCollectionAccount) {
    sellerCollectionAccount = _Item.create({ id: sellerCollectionAccountID });
    sellerCollectionAccount.save();
    collection.sellerCount += 1;
  }

  collection.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH + priceETH;

  collection.save();

  // Update Collection revenue metrics
  // updateCollectionRevenueMetrics(call, collectionAddr, priceETH, isBundle);

  // Update Collection daily snapshot
  let collectionSnapshot = await getOrCreateCollectionDailySnapshot(
    collectionAddr,
    Number(call.blockTimestamp)
  );

  // collectionSnapshot.blockNumber = call.blockNumber;
  // collectionSnapshot.timestamp = call.blockTimestamp;
  collectionSnapshot.royaltyFee = collection.royaltyFee;

  // Update daily metrics
  if (newDailyTradedItem) {
    collectionSnapshot.dailyTradedItemCount += 1;
  }

  collectionSnapshot.dailyTradeVolumeETH =
    collectionSnapshot.dailyTradeVolumeETH + priceETH;

  if (!isBundle) {
    collectionSnapshot.dailyMinSalePrice = Number(
      min(collectionSnapshot.dailyMinSalePrice, priceETH)
    );
    collectionSnapshot.dailyMaxSalePrice = Number(
      max(collectionSnapshot.dailyMaxSalePrice, priceETH)
    );
  }

  // Update snapshot metrics
  collectionSnapshot.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH;
  collectionSnapshot.marketplaceRevenueETH = collection.marketplaceRevenueETH;
  collectionSnapshot.creatorRevenueETH = collection.creatorRevenueETH;
  collectionSnapshot.totalRevenueETH = collection.totalRevenueETH;
  collectionSnapshot.tradeCount = collection.tradeCount;

  collectionSnapshot.save();
}

async function updateMarketplaceMetrics(
  call: AtomicMatch_Transaction,
  collectionAddrs: string[],
  buyer: string,
  seller: string,
  priceETH: number,
  dailyTradedItems: number
): Promise<void> {
  let marketplace = await getOrCreateMarketplace(
    NetworkConfigs.getMarketplaceAddress()
  );
  marketplace.tradeCount += 1;
  marketplace.cumulativeTradeVolumeETH =
    marketplace.cumulativeTradeVolumeETH + priceETH;

  let buyerAccountID = "MARKETPLACE_ACCOUNT-".concat(buyer);
  let buyerAccount = await _Item.get(buyerAccountID);
  if (!buyerAccount) {
    buyerAccount = _Item.create({ id: buyerAccountID });
    buyerAccount.save();
    marketplace.cumulativeUniqueTraders += 1;
  }
  let sellerAccountID = "MARKETPLACE_ACCOUNT-".concat(seller);
  let sellerAccount = await _Item.get(sellerAccountID);
  if (!sellerAccount) {
    sellerAccount = await _Item.create({ id: sellerAccountID });
    sellerAccount.save();
    marketplace.cumulativeUniqueTraders += 1;
  }
  marketplace.save();

  // Update Marketplace revenue metrics
  // updateMarketplaceRevenueMetrics(call, priceETH);

  // Update Marketplace daily snapshot
  let marketplaceSnapshot = await getOrCreateMarketplaceDailySnapshot(
    Number(call.blockTimestamp)
  );
  // marketplaceSnapshot.blockNumber = call.blocknumber;
  // marketplaceSnapshot.timestamp = call.block.timestamp;

  // Update daily metrics
  for (let i = 0; i < collectionAddrs.length; i++) {
    let collectionAddr = collectionAddrs[i];
    let dailyTradedCollectionID = "DAILY_TRADED_COLLECTION-"
      .concat(collectionAddr)
      .concat("-")
      .concat((Number(call.blockTimestamp) / SECONDS_PER_DAY).toString());
    let dailyTradedCollection = await _Item.get(dailyTradedCollectionID);
    if (!dailyTradedCollection) {
      dailyTradedCollection = await _Item.create({
        id: dailyTradedCollectionID,
      });
      dailyTradedCollection.save();
      marketplaceSnapshot.dailyTradedCollectionCount += 1;
    }
  }

  let dailyBuyerID = "DAILY_MARKERPLACE_ACCOUNT-".concat(buyer);
  let dailyBuyer = await _Item.get(dailyBuyerID);
  if (!dailyBuyer) {
    dailyBuyer = _Item.create({ id: dailyBuyerID });
    dailyBuyer.save();
    marketplaceSnapshot.dailyActiveTraders += 1;
  }

  let dailySellerID = "DAILY_MARKETPLACE_ACCOUNT-".concat(seller);
  let dailySeller = await _Item.get(dailySellerID);
  if (!dailySeller) {
    dailySeller = await _Item.create({ id: dailySellerID });
    dailySeller.save();
    marketplaceSnapshot.dailyActiveTraders += 1;
  }

  marketplaceSnapshot.dailyTradedItemCount += dailyTradedItems;

  // Update snapshot metrics
  marketplaceSnapshot.collectionCount = marketplace.collectionCount;
  marketplaceSnapshot.cumulativeTradeVolumeETH =
    marketplace.cumulativeTradeVolumeETH;
  marketplaceSnapshot.marketplaceRevenueETH = marketplace.marketplaceRevenueETH;
  marketplaceSnapshot.creatorRevenueETH = marketplace.creatorRevenueETH;
  marketplaceSnapshot.totalRevenueETH = marketplace.totalRevenueETH;
  marketplaceSnapshot.tradeCount = marketplace.tradeCount;
  marketplaceSnapshot.cumulativeUniqueTraders =
    marketplace.cumulativeUniqueTraders;

  marketplaceSnapshot.save();
}

// async function updateCollectionRevenueMetrics(
//   call: AtomicMatch_Transaction,
//   collectionAddr: string,
//   priceETH: number,
//   isBundle: boolean
// ): Promise<void> {
//   let collection = await getOrCreateCollection(collectionAddr);
//   assert(call.args);
//   let sellSideFeeRecipient = call.args[0][10];
//   if (sellSideFeeRecipient.toString() != NULL_ADDRESS.toString()) {
//     // Sell-side order is maker (sale)
//     let makerRelayerFee = await call.args[1][9];
//     let creatorRoyaltyFeePercentage;

//     if (EXCHANGE_MARKETPLACE_FEE <= makerRelayerFee) {
//       creatorRoyaltyFeePercentage =
//         (Number(makerRelayerFee) - Number(EXCHANGE_MARKETPLACE_FEE)) / Number(BIGDECIMAL_HUNDRED);
//     } else {
//       creatorRoyaltyFeePercentage = BIGDECIMAL_ZERO;
//     }

//     // ? makerRelayerFee
//     //     .minus(EXCHANGE_MARKETPLACE_FEE)
//     //     .divDecimal(BIGDECIMAL_HUNDRED)
//     // : BIGDECIMAL_ZERO;

//     // Do not update if bundle sale
//     if (
//       collection.royaltyFee != creatorRoyaltyFeePercentage &&
//       !isBundle
//     ) {
//       collection.royaltyFee = Number(creatorRoyaltyFeePercentage);
//     }

//     let totalRevenueETH = makerRelayerFee
//       .toBigDecimal()
//       .times(priceETH)
//       .div(INVERSE_BASIS_POINT);
//     let marketplaceRevenueETH = EXCHANGE_MARKETPLACE_FEE.le(makerRelayerFee)
//       ? EXCHANGE_MARKETPLACE_FEE.toBigDecimal()
//           .times(priceETH)
//           .div(INVERSE_BASIS_POINT)
//       : BIGDECIMAL_ZERO;
//     let creatorRevenueETH = totalRevenueETH.minus(marketplaceRevenueETH);

//     // Update Collection revenue
//     collection.totalRevenueETH =
//       collection.totalRevenueETH.plus(totalRevenueETH);
//     collection.marketplaceRevenueETH = collection.marketplaceRevenueETH.plus(
//       marketplaceRevenueETH
//     );
//     collection.creatorRevenueETH =
//       collection.creatorRevenueETH.plus(creatorRevenueETH);
//   } else {
//     // Buy-side order is maker (bid/offer)
//     let takerRelayerFee = call.inputs.uints[1];
//     let creatorRoyaltyFeePercentage = EXCHANGE_MARKETPLACE_FEE.le(
//       takerRelayerFee
//     )
//       ? takerRelayerFee
//           .minus(EXCHANGE_MARKETPLACE_FEE)
//           .divDecimal(BIGDECIMAL_HUNDRED)
//       : BIGDECIMAL_ZERO;

//     // Do not update if bundle sale
//     if (
//       collection.royaltyFee.notEqual(creatorRoyaltyFeePercentage) &&
//       !isBundle
//     ) {
//       collection.royaltyFee = creatorRoyaltyFeePercentage;
//     }

//     let totalRevenueETH = takerRelayerFee
//       .toBigDecimal()
//       .times(priceETH)
//       .div(INVERSE_BASIS_POINT);
//     let marketplaceRevenueETH = EXCHANGE_MARKETPLACE_FEE.le(takerRelayerFee)
//       ? EXCHANGE_MARKETPLACE_FEE.toBigDecimal()
//           .times(priceETH)
//           .div(INVERSE_BASIS_POINT)
//       : BIGDECIMAL_ZERO;
//     let creatorRevenueETH = totalRevenueETH.minus(marketplaceRevenueETH);

//     // Update Collection revenue
//     collection.totalRevenueETH =
//       collection.totalRevenueETH.plus(totalRevenueETH);
//     collection.marketplaceRevenueETH = collection.marketplaceRevenueETH.plus(
//       marketplaceRevenueETH
//     );
//     collection.creatorRevenueETH =
//       collection.creatorRevenueETH.plus(creatorRevenueETH);
//   }

//   collection.save();
// }

// function updateMarketplaceRevenueMetrics(
//   call: AtomicMatch_Call,
//   priceETH: BigDecimal
// ): void {
//   let marketplace = getOrCreateMarketplace(
//     NetworkConfigs.getMarketplaceAddress()
//   );

//   let sellSideFeeRecipient = call.inputs.addrs[10];
//   if (sellSideFeeRecipient.notEqual(NULL_ADDRESS)) {
//     // Sell-side order is maker (sale)
//     let makerRelayerFee = call.inputs.uints[9];

//     let totalRevenueETH = makerRelayerFee
//       .toBigDecimal()
//       .times(priceETH)
//       .div(INVERSE_BASIS_POINT);
//     let marketplaceRevenueETH = EXCHANGE_MARKETPLACE_FEE.le(makerRelayerFee)
//       ? EXCHANGE_MARKETPLACE_FEE.toBigDecimal()
//           .times(priceETH)
//           .div(INVERSE_BASIS_POINT)
//       : BIGDECIMAL_ZERO;
//     let creatorRevenueETH = totalRevenueETH.minus(marketplaceRevenueETH);

//     // Update Marketplace revenue
//     marketplace.totalRevenueETH =
//       marketplace.totalRevenueETH.plus(totalRevenueETH);
//     marketplace.marketplaceRevenueETH = marketplace.marketplaceRevenueETH.plus(
//       marketplaceRevenueETH
//     );
//     marketplace.creatorRevenueETH =
//       marketplace.creatorRevenueETH.plus(creatorRevenueETH);
//   } else {
//     // Buy-side order is maker (bid/offer)
//     let takerRelayerFee = call.inputs.uints[1];

//     let totalRevenueETH = takerRelayerFee
//       .toBigDecimal()
//       .times(priceETH)
//       .div(INVERSE_BASIS_POINT);
//     let marketplaceRevenueETH = EXCHANGE_MARKETPLACE_FEE.le(takerRelayerFee)
//       ? EXCHANGE_MARKETPLACE_FEE.toBigDecimal()
//           .times(priceETH)
//           .div(INVERSE_BASIS_POINT)
//       : BIGDECIMAL_ZERO;
//     let creatorRevenueETH = totalRevenueETH.minus(marketplaceRevenueETH);

//     // Update Marketplace revenue
//     marketplace.totalRevenueETH =
//       marketplace.totalRevenueETH.plus(totalRevenueETH);
//     marketplace.marketplaceRevenueETH = marketplace.marketplaceRevenueETH.plus(
//       marketplaceRevenueETH
//     );
//     marketplace.creatorRevenueETH =
//       marketplace.creatorRevenueETH.plus(creatorRevenueETH);
//   }

//   marketplace.save();
// }
