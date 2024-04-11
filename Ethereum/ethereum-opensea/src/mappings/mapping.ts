import { OrderFulfilledLog } from "../types/abi-interfaces/SeaportExchangeAbi";
import {
  Collection,
  CollectionDailySnapshot,
  Marketplace,
  MarketplaceDailySnapshot,
  _OrderFulfillment,
  Trade,
  _Item,
  _OrderFulfillmentMethod,
  NftStandard,
} from "../types";
import {
  BIGDECIMAL_HUNDRED,
  BIGDECIMAL_MAX,
  BIGDECIMAL_ZERO,
  BIGINT_ZERO,
  orderFulfillmentMethod,
  tradeStrategy,
  ERC1155_INTERFACE_IDENTIFIER,
  ERC721_INTERFACE_IDENTIFIER,
  isERC1155,
  isERC721,
  isMoney,
  isNFT,
  isOpenSeaFeeAccount,
  MANTISSA_FACTOR,
  SeaportItemType,
  SECONDS_PER_DAY,
  WETH_ADDRESS,
  MARKETPLACE_ADDRESS,
} from "./helper";
import { NftMetadata__factory } from "../types/contracts";
import assert from "assert";
import {
  SpentItemStructOutput,
  ReceivedItemStructOutput,
} from "../types/contracts/SeaportExchangeAbi";
import { BigNumber } from "ethers";
import { ERC165__factory } from "../types/contracts/factories/ERC165__factory";

class Sale {
  constructor(
    public readonly buyer: string,
    public readonly seller: string,
    public readonly nfts: NFTs,
    public readonly money: Money,
    public readonly fees: Fees
  ) {}
}

class NFTs {
  constructor(
    public readonly collection: string,
    public readonly standard: string,
    public readonly tokenIds: Array<BigNumber>,
    public readonly amounts: Array<BigNumber>
  ) {}
}

class Money {
  constructor(public readonly amount: number) {}
}

class Fees {
  constructor(
    public readonly protocolRevenue: number,
    public readonly creatorRevenue: number
  ) {}
}

/**
 * OrderFulfilled is good because it contains literally all neede data build up a `Trade` entity.
 * OrderFulfilled is also bad because it is very generic, requiring a lot of hidden knowledge to decipher its actual meaning.
 *
 * Hidden knowledge:
 * - `offer` and `consideration` are key to determine a NFT sale details.
 * - usually a pair of (offer, consideration) contains 4 items: the NFT, the sale volume, the protocol fee, and the royalty fee.
 * - both protocol fee and royalty fee exist in `consideration`
 * - protocol fee goes to a few addresses owned by opensea, see method `isOpenSeaFeeAccount`
 * - royalty fee goes to beneficiary account, the NFT collector admin can specify this
 * - the NFT and the sale volume exists in either `offer` or `consideration`
 * - if `offer` = [NFT], `consideration` = [sale volume, protocol fee, royalty fee], then the OrderFulfilled represents a ask, offerer = seller
 * - if `offer` = [sale volume], `consideration` = [NFT, protocol fee, royalty fee], then the OrderFulfilled represents a bid, offerer = buyer
 *
 * Note that the situation we describe above are usual cases. There are know corner cases that we need to handle:
 * - `offer` empty
 * - `consideration` empty, eg https://etherscan.io/tx/0xf72b9782adb5620fa20b8f322d231f8724728fd5411cabc870cbc24c6ca89527
 * - cannot find protocol fee from `consideration`, eg https://etherscan.io/tx/0xaaa0a8fd58c62952dbd198579826a1fefb48f34e8c97b7319e365e74eaaa24ec
 *
 * Know limitations:
 * - We are not handling bundle sale where NFTs from multiple collections are exchanged since we don't know how to treat the price, eg https://etherscan.io/tx/0xd8d2612fe4995478bc7537eb46786c3d6f0b13b1c50e01e04067eb92ba298d17
 */
export async function handleOrderFulfilled(
  event: OrderFulfilledLog
): Promise<void> {
  assert(event.args);
  const offerer = event.args.offerer;
  const recipient = event.args.recipient;
  const offer = event.args.offer;
  const consideration = event.args.consideration;
  const saleResult = tryGetSale(
    event,
    offerer,
    recipient,
    offer,
    consideration
  );
  if (!saleResult) {
    return;
  }
  const isBundle = saleResult.nfts.tokenIds.length > 1;
  const collectionAddr = saleResult.nfts.collection.toString();
  const collection = await getOrCreateCollection(collectionAddr);
  const buyer = saleResult.buyer.toString();
  const seller = saleResult.seller.toString();
  const royaltyFee =
    (saleResult.fees.creatorRevenue / saleResult.money.amount) *
    BIGDECIMAL_HUNDRED;
  const totalNftAmount = saleResult.nfts.amounts.reduce(
    (acc, curr) => acc + BigInt(curr.toString()),
    BIGINT_ZERO
  );
  const volumeETH = saleResult.money.amount / MANTISSA_FACTOR;
  const priceETH = volumeETH / Number(totalNftAmount);

  //
  // new trade
  //
  const nNewTrade = saleResult.nfts.tokenIds.length;
  for (let i = 0; i < nNewTrade; i++) {
    const tradeID = isBundle
      ? event.transactionHash
          .toString()
          .concat("-")
          .concat(event.logIndex.toString())
          .concat("-")
          .concat(i.toString())
      : event.transactionHash
          .toString()
          .concat("-")
          .concat(event.logIndex.toString());

    const trade = Trade.create({
      id: tradeID,
      transactionHash: event.transactionHash.toString(),
      logIndex: Number(event.logIndex),
      timestamp: event.block.timestamp,
      blockNumber: BigInt(event.block.number),
      isBundle: isBundle,
      collectionId: collectionAddr,
      tokenId: saleResult.nfts.tokenIds[i].toBigInt(),
      priceETH: priceETH,
      amount: saleResult.nfts.amounts[i].toBigInt(),
      buyer: buyer,
      seller: seller,
      strategy: tradeStrategy(event),
    });
    // if it is a basic order then STANDARD_SALE
    // otherwise ANY_ITEM_FROM_SET.
    // TODO: ANY_ITEM_FROM_SET correct strategy? Cannot find docs on how to decide
    await trade.save();

    // Save details of how trade was fulfilled
    const orderFulfillment = _OrderFulfillment.create({
      id: tradeID,
      tradeId: tradeID,
      orderFulfillmentMethod: orderFulfillmentMethod(event),
    });
    await orderFulfillment.save();
  }

  // //
  // // update collection
  // //
  collection.tradeCount += nNewTrade;
  collection.royaltyFee = royaltyFee;
  const buyerCollectionAccountID = "COLLECTION_ACCOUNT-BUYER-"
    .concat(collection.id)
    .concat("-")
    .concat(buyer);
  let buyerCollectionAccount = await _Item.get(buyerCollectionAccountID);
  if (!buyerCollectionAccount) {
    buyerCollectionAccount = new _Item(buyerCollectionAccountID);
    await buyerCollectionAccount.save();
    collection.buyerCount += 1;
  }
  const sellerCollectionAccountID = "COLLECTION_ACCOUNT-SELLER-"
    .concat(collection.id)
    .concat("-")
    .concat(seller);
  let sellerCollectionAccount = await _Item.get(sellerCollectionAccountID);
  if (!sellerCollectionAccount) {
    sellerCollectionAccount = _Item.create({
      id: sellerCollectionAccountID,
    });
    await sellerCollectionAccount.save();
    collection.sellerCount += 1;
  }
  collection.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH + volumeETH;
  const deltaMarketplaceRevenueETH =
    saleResult.fees.protocolRevenue / MANTISSA_FACTOR;
  const deltaCreatorRevenueETH =
    saleResult.fees.creatorRevenue / MANTISSA_FACTOR;
  collection.marketplaceRevenueETH =
    collection.marketplaceRevenueETH + deltaMarketplaceRevenueETH;
  collection.creatorRevenueETH =
    collection.creatorRevenueETH + deltaCreatorRevenueETH;
  collection.totalRevenueETH =
    collection.marketplaceRevenueETH + collection.creatorRevenueETH;
  await collection.save();

  // //
  // // update marketplace
  // //
  const marketplace = await getOrCreateMarketplace(MARKETPLACE_ADDRESS);
  marketplace.tradeCount += 1;
  marketplace.cumulativeTradeVolumeETH =
    marketplace.cumulativeTradeVolumeETH + volumeETH;
  marketplace.marketplaceRevenueETH =
    marketplace.marketplaceRevenueETH + deltaMarketplaceRevenueETH;
  marketplace.creatorRevenueETH =
    marketplace.creatorRevenueETH + deltaCreatorRevenueETH;
  marketplace.totalRevenueETH =
    marketplace.marketplaceRevenueETH + marketplace.creatorRevenueETH;
  const buyerAccountID = "MARKETPLACE_ACCOUNT-".concat(buyer);
  let buyerAccount = await _Item.get(buyerAccountID);
  if (!buyerAccount) {
    buyerAccount = _Item.create({ id: buyerAccountID });
    await buyerAccount.save();
    marketplace.cumulativeUniqueTraders += 1;
  }
  const sellerAccountID = "MARKETPLACE_ACCOUNT-".concat(seller);
  let sellerAccount = await _Item.get(sellerAccountID);
  if (!sellerAccount) {
    sellerAccount = new _Item(sellerAccountID);
    await sellerAccount.save();
    marketplace.cumulativeUniqueTraders += 1;
  }
  await marketplace.save();

  // prepare for updating dailyTradedItemCount
  let newDailyTradedItem = 0;
  for (let i = 0; i < nNewTrade; i++) {
    const dailyTradedItemID = "DAILY_TRADED_ITEM-"
      .concat(collectionAddr)
      .concat("-")
      .concat(saleResult.nfts.tokenIds[i].toString())
      .concat("-")
      .concat((Number(event.block.timestamp) / SECONDS_PER_DAY).toString());
    let dailyTradedItem = await _Item.get(dailyTradedItemID);
    if (!dailyTradedItem) {
      dailyTradedItem = new _Item(dailyTradedItemID);
      dailyTradedItem.save();
      newDailyTradedItem++;
    }
  }
  // //
  // // take collection snapshot
  // //
  const collectionSnapshot = await getOrCreateCollectionDailySnapshot(
    collectionAddr,
    event.block.timestamp
  );
  collectionSnapshot.blockNumber = BigInt(event.block.number);
  collectionSnapshot.timestamp = event.block.timestamp;
  collectionSnapshot.royaltyFee = collection.royaltyFee;
  collectionSnapshot.dailyMinSalePrice = Math.min(
    collectionSnapshot.dailyMinSalePrice,
    priceETH
  );
  collectionSnapshot.dailyMaxSalePrice = Math.max(
    collectionSnapshot.dailyMaxSalePrice,
    priceETH
  );
  collectionSnapshot.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH;
  collectionSnapshot.marketplaceRevenueETH = collection.marketplaceRevenueETH;
  collectionSnapshot.creatorRevenueETH = collection.creatorRevenueETH;
  collectionSnapshot.totalRevenueETH = collection.totalRevenueETH;
  collectionSnapshot.tradeCount = collection.tradeCount;
  collectionSnapshot.dailyTradeVolumeETH =
    collectionSnapshot.dailyTradeVolumeETH + volumeETH;
  collectionSnapshot.dailyTradedItemCount += newDailyTradedItem;
  await collectionSnapshot.save();

  // //
  // // take marketplace snapshot
  // //
  const marketplaceSnapshot = await getOrCreateMarketplaceDailySnapshot(
    event.block.timestamp
  );
  marketplaceSnapshot.blockNumber = BigInt(event.block.number);
  marketplaceSnapshot.timestamp = event.block.timestamp;
  marketplaceSnapshot.collectionCount = marketplace.collectionCount;
  marketplaceSnapshot.cumulativeTradeVolumeETH =
    marketplace.cumulativeTradeVolumeETH;
  marketplaceSnapshot.marketplaceRevenueETH = marketplace.marketplaceRevenueETH;
  marketplaceSnapshot.creatorRevenueETH = marketplace.creatorRevenueETH;
  marketplaceSnapshot.totalRevenueETH = marketplace.totalRevenueETH;
  marketplaceSnapshot.tradeCount = marketplace.tradeCount;
  marketplaceSnapshot.cumulativeUniqueTraders =
    marketplace.cumulativeUniqueTraders;
  const dailyBuyerID = "DAILY_MARKERPLACE_ACCOUNT-".concat(buyer);
  let dailyBuyer = await _Item.get(dailyBuyerID);
  if (!dailyBuyer) {
    dailyBuyer = new _Item(dailyBuyerID);
    await dailyBuyer.save();
    marketplaceSnapshot.dailyActiveTraders += 1;
  }
  const dailySellerID = "DAILY_MARKETPLACE_ACCOUNT-".concat(seller);
  let dailySeller = await _Item.get(dailySellerID);
  if (!dailySeller) {
    dailySeller = _Item.create({ id: dailySellerID });
    await dailySeller.save();
    marketplaceSnapshot.dailyActiveTraders += 1;
  }
  const dailyTradedCollectionID = "DAILY_TRADED_COLLECTION-"
    .concat(collectionAddr)
    .concat("-")
    .concat((Number(event.block.timestamp) / SECONDS_PER_DAY).toString());
  let dailyTradedCollection = await _Item.get(dailyTradedCollectionID);
  if (!dailyTradedCollection) {
    dailyTradedCollection = new _Item(dailyTradedCollectionID);
    await dailyTradedCollection.save();
    marketplaceSnapshot.dailyTradedCollectionCount += 1;
  }
  marketplaceSnapshot.dailyTradedItemCount += newDailyTradedItem;
  await marketplaceSnapshot.save();
}

async function getOrCreateCollection(
  collectionID: string
): Promise<Collection> {
  let collection = await Collection.get(collectionID);
  if (!collection) {
    logger.info(`Getting nft info ${collectionID}`);
    const contract = NftMetadata__factory.connect(collectionID, api);

    const [name, symbol, totalSupply] = await Promise.all([
      contract.name().catch(e => undefined),
      contract.symbol().catch(e => undefined),
      contract.totalSupply().catch(e => undefined),
    ]);
    collection = Collection.create({
      id: collectionID,
      nftStandard: await getNftStandard(collectionID),
      royaltyFee: BIGDECIMAL_ZERO,
      cumulativeTradeVolumeETH: BIGDECIMAL_ZERO,
      marketplaceRevenueETH: BIGDECIMAL_ZERO,
      creatorRevenueETH: BIGDECIMAL_ZERO,
      totalRevenueETH: BIGDECIMAL_ZERO,
      tradeCount: 0,
      buyerCount: 0,
      sellerCount: 0,
      name,
      symbol,
      totalSupply: totalSupply?.toBigInt() ?? BigInt(0),
    });
    await collection.save();

    const marketplace = await getOrCreateMarketplace(MARKETPLACE_ADDRESS);
    marketplace.collectionCount += 1;
    await marketplace.save();
  }
  return collection;
}

async function getOrCreateMarketplace(
  marketplaceID: string
): Promise<Marketplace> {
  let marketplace = await Marketplace.get(marketplaceID);
  if (!marketplace) {
    marketplace = Marketplace.create({
      id: marketplaceID,
      collectionCount: 0,
      tradeCount: 0,
      cumulativeTradeVolumeETH: 0,
      marketplaceRevenueETH: 0,
      creatorRevenueETH: 0,
      totalRevenueETH: 0,
      cumulativeUniqueTraders: 0,
    });
    // marketplace.name = NetworkConfigs.getProtocolName();
    // marketplace.slug = NetworkConfigs.getProtocolSlug();
    // marketplace.network = NetworkConfigs.getNetwork();
    // marketplace.schemaVersion = NetworkConfigs.getSchemaVersion();
    // marketplace.subgraphVersion = NetworkConfigs.getSubgraphVersion();
    // marketplace.methodologyVersion = NetworkConfigs.getMethodologyVersion();
    await marketplace.save();
  }
  return marketplace;
}

async function getOrCreateCollectionDailySnapshot(
  collection: string,
  timestamp: BigInt
): Promise<CollectionDailySnapshot> {
  const snapshotID = collection
    .concat("-")
    .concat((Number(timestamp) / SECONDS_PER_DAY).toString());
  let snapshot = await CollectionDailySnapshot.get(snapshotID);
  if (!snapshot) {
    snapshot = CollectionDailySnapshot.create({
      id: snapshotID,
      collectionId: collection,
      blockNumber: BigInt(0),
      timestamp: BigInt(0),
      royaltyFee: 0,
      cumulativeTradeVolumeETH: 0,
      dailyTradeVolumeETH: 0,
      marketplaceRevenueETH: 0,
      creatorRevenueETH: 0,
      tradeCount: 0,
      dailyTradedItemCount: 0,
      dailyMinSalePrice: BIGDECIMAL_MAX,
      dailyMaxSalePrice: 0,
      totalRevenueETH: 0,
    });
    await snapshot.save();
  }
  return snapshot;
}

async function getOrCreateMarketplaceDailySnapshot(
  timestamp: BigInt
): Promise<MarketplaceDailySnapshot> {
  const snapshotID = (Number(timestamp) / SECONDS_PER_DAY).toString();
  let snapshot = await MarketplaceDailySnapshot.get(snapshotID);
  if (!snapshot) {
    snapshot = MarketplaceDailySnapshot.create({
      id: snapshotID,
      marketplaceId: MARKETPLACE_ADDRESS,
      blockNumber: BigInt(0),
      timestamp: BigInt(0),
      marketplaceRevenueETH: 0,
      creatorRevenueETH: 0,
      tradeCount: 0,
      dailyTradedItemCount: 0,
      totalRevenueETH: 0,
      cumulativeTradeVolumeETH: 0,
      collectionCount: 0,
      cumulativeUniqueTraders: 0,
      dailyActiveTraders: 0,
      dailyTradedCollectionCount: 0,
    });
    await snapshot.save();
  }
  return snapshot;
}

async function getNftStandard(collectionID: string): Promise<NftStandard> {
  logger.info(`Getting nft standard ${collectionID}`);
  const erc165 = ERC165__factory.connect(collectionID, api);

  try {
    const isERC721Result = await erc165.supportsInterface(
      ERC721_INTERFACE_IDENTIFIER
    );
    if (isERC721Result) {
      return NftStandard.ERC721;
    }
  } catch (e) {
    logger.warn(`[getNftStandard] isERC721 reverted on ${collectionID}`);
  }

  try {
    const isERC1155Result = await erc165.supportsInterface(
      ERC1155_INTERFACE_IDENTIFIER,
    );

    if (isERC1155Result) {
      return NftStandard.ERC1155;
    }
  } catch (e) {
    logger.warn(`[getNftStandard] isERC1155 reverted on ${collectionID}`);
  }

  return NftStandard.UNKNOWN;
}

// // Use best effort to figure out the following data that construct a `Sale`:
// // - Who is the buyer and seller?
// // - What's the sale volume? (money)
// // - What NFTs are involved? (nfts)
// // - What fees are allocated? (fees)
// //
// // This can be tricky because it is either a bid offer or an ask offer :(

function tryGetSale(
  // this `event` param is entirely for logging purpose
  event: OrderFulfilledLog,
  offerer: string,
  recipient: string,
  offer: Array<SpentItemStructOutput>,
  consideration: Array<ReceivedItemStructOutput>
): Sale | null {
  const txn = event.transactionHash.toString();
  const txnLogIdx = event.transactionIndex.toString();

  // if non weth erc20, ignore
  for (let i = 0; i < offer.length; i++) {
    logger.warn(`Printing offer ${i} elements: ${offer}`);
    if (
      offer[i].itemType == SeaportItemType.ERC20 &&
      offer[i].token != WETH_ADDRESS
    ) {
      logger.warn(`Returning null`);
      return null;
    }
  }
  for (let i = 0; i < consideration.length; i++) {
    if (
      consideration[i].itemType == SeaportItemType.ERC20 &&
      consideration[i].token != WETH_ADDRESS
    ) {
      logger.warn(`Returning null`);
      return null;
    }
  }

  // offer empty or consideration empty is odd but it happens
  // when a transaction emits more than 1 OrderFulfilled events
  // these events are usually relevant to each other in a way
  // though haven't figured out how to treat them correctly to match etherscan result :(

  if (offer.length == 0) {
    logger.warn(`[${txn}-${txnLogIdx}] offer empty`);
    return null;
  }
  if (consideration.length == 0) {
    logger.warn(`[${txn}-${txnLogIdx}] consideration empty`);
    return null;
  }

  // if money is in `offer` then NFTs are must in `consideration`
  const moneyInOffer = offer.length == 1 && isMoney(offer[0].itemType);
  if (moneyInOffer) {
    const considerationNFTsResult = tryGetNFTsFromConsideration(consideration);
    if (!considerationNFTsResult) {
      logger.warn(
        `[${txn}] nft not found or multiple nfts found in consideration: ${_DEBUG_join(
            consideration.map<string>((c) => _DEBUG_considerationToString(c))
          )}`
      );
      return null;
    }
    return new Sale(
      offerer,
      recipient,
      considerationNFTsResult,
      getMoneyFromOffer(offer[0]),
      getFees(txn, recipient, consideration)
    );
  } else {
    // otherwise, money is in `consideration` and NFTs are in `offer`
    logger.warn("Not implemented yet");
    const considerationMoneyResult =
      tryGetMoneyFromConsideration(consideration);
    if (!considerationMoneyResult) {
      logger.warn(`[${txn}] money not found in consideration: ${
        _DEBUG_considerationToString(consideration[0])
      } ${
        _DEBUG_join(consideration.map<string>((c) => _DEBUG_considerationToString(c)))
      }`);
      return null;
    }
    const offerNFTsResult = tryGetNFTsFromOffer(offer);
    if (!offerNFTsResult) {
      logger.warn(`[${txn}] nft not found or multiple nfts found in offer: ${_DEBUG_join(offer.map<string>((o) => _DEBUG_offerToString(o)))}`);
      return null;
    }
    return new Sale(
      recipient,
      offerer,
      offerNFTsResult,
      considerationMoneyResult,
      getFees(txn, offerer, consideration)
    );
  }
}

function getMoneyFromOffer(o: SpentItemStructOutput): Money {
  return new Money(Number(o.amount));
}

// // Add up all money amounts in consideration in order to get the trade volume
function tryGetMoneyFromConsideration(
  consideration: Array<ReceivedItemStructOutput>
): Money | null {
  let hasMoney = false;
  let amount = 0;
  for (let i = 0; i < consideration.length; i++) {
    if (isMoney(consideration[i].itemType)) {
      hasMoney = true;
      amount = Number(amount) + Number(consideration[i].amount);
    }
  }
  if (!hasMoney) {
    return null;
  }
  return new Money(amount);
}

function tryGetNFTsFromOffer(offer: Array<SpentItemStructOutput>): NFTs | null {
  if (offer.some((o) => !isNFT(o.itemType))) {
    return null;
  }
  const collection = offer[0].token;
  const tpe = offer[0].itemType;
  const tokenIds: Array<BigNumber> = [];
  const amounts: Array<BigNumber> = [];
  for (let i = 0; i < offer.length; i++) {
    const o = offer[i];
    if (o.token != collection) {
      logger.warn("[tryGetNFTsFromOffer] we're not handling collection > 1 case");
      return null;
    }
    tokenIds.push(o.identifier);
    amounts.push(o.amount);
  }
  const standard = isERC721(tpe)
    ? NftStandard.ERC721
    : isERC1155(tpe)
    ? NftStandard.ERC1155
    : NftStandard.UNKNOWN;
  return new NFTs(collection, standard, tokenIds, amounts);
}

function tryGetNFTsFromConsideration(
  consideration: Array<ReceivedItemStructOutput>
): NFTs | null {
  const nftItems = consideration.filter((c) => isNFT(c.itemType));
  if (nftItems.length == 0) {
    return null;
  }
  const collection = nftItems[0].token;
  const tpe = nftItems[0].itemType;
  const tokenIds: Array<BigNumber> = [];
  const amounts: Array<BigNumber> = [];
  for (let i = 0; i < nftItems.length; i++) {
    const item = nftItems[i];
    if (item.token != collection) {
      logger.warn("[tryGetNFTsFromConsideration] we're not handling collection > 1 case");
      return null;
    }
    tokenIds.push(item.identifier);
    amounts.push(item.amount);
  }
  const standard = isERC721(tpe)
    ? NftStandard.ERC721
    : isERC1155(tpe)
    ? NftStandard.ERC1155
    : NftStandard.UNKNOWN;
  return new NFTs(collection, standard, tokenIds, amounts);
}

// // `consideration` could contain: royalty transfer, opeasea fee, and sale transfer itself
// // known edge cases are:
// // - opensea fee not found
function getFees(
  txn: string,
  excludedRecipient: string,
  consideration: Array<ReceivedItemStructOutput>
): Fees {
  const protocolFeeItems = consideration.filter((c) =>
    isOpenSeaFeeAccount(c.recipient)
  );
  let protocolRevenue = 0;
  if (protocolFeeItems.length == 0) {
    logger.warn(`[${txn}] known issue: protocol fee not found, consideration ${_DEBUG_join(
        consideration.map<string>((c) => _DEBUG_considerationToString(c))
      )}`);
  } else {
    protocolRevenue = Number(protocolFeeItems[0].amount);
  }

  const royaltyFeeItems: Array<ReceivedItemStructOutput> = [];
  for (let i = 0; i < consideration.length; i++) {
    const c = consideration[i];
    if (!isOpenSeaFeeAccount(c.recipient) && c.recipient != excludedRecipient) {
      royaltyFeeItems.push(c);
    }
  }
  const royaltyRevenue = Number(
    royaltyFeeItems.length > 0 ? royaltyFeeItems[0].amount : BIGINT_ZERO
  );

  return new Fees(protocolRevenue, royaltyRevenue);
}

// //
// // Useful utilities for finding unhandled edge cases
// //

function _DEBUG_offerToString(item: SpentItemStructOutput): string {
  return `Offer(type=${
    item.itemType
  }, token=${item.token.toString()}, id=${item.identifier.toString()}, amount=${item.amount.toString()})`;
}

function _DEBUG_considerationToString(item: ReceivedItemStructOutput): string {
  return `Consideration(type=${
    item.itemType
  }, token=${item.token.toString()}, id=${item.identifier.toString()}, amount=${item.amount.toString()}, recipient=${item.recipient.toString()})`;
}

function _DEBUG_join(ss: Array<string>): string {
  let s = "";
  for (let i = 0; i < ss.length; i++) {
    if (i > 0) {
      s += " ";
    }
    s += ss[i];
  }
  return s;
}
