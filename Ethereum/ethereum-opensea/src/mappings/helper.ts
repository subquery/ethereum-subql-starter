import { OrderFulfilledLog } from "../types/abi-interfaces/SeaportExchangeAbi";
import { SaleStrategy } from "../types";

export namespace MethodSignatures {
  export const FULFILL_BASIC_ORDER = "0XFB0F3EE1";
  export const FULFILL_ORDER = "0XB3A34C4C";
  export const FULFILL_ADVANCED_ORDER = "0XE7ACAB24";
  export const FULFILL_AVAILABLE_ORDERS = "0XED98A574";
  export const FULFILL_AVAILABLE_ADVANCED_ORDERS = "0X87201B41";
  export const MATCH_ORDERS = "0XA8174404";
  export const MATCH_ADVANCED_ORDERS = "0X55944A42";
}

export namespace OrderFulfillmentMethods {
  export const FULFILL_BASIC_ORDER = "FULFILL_BASIC_ORDER";
  export const FULFILL_ORDER = "FULFILL_ORDER";
  export const FULFILL_ADVANCED_ORDER = "FULFILL_ADVANCED_ORDER";
  export const FULFILL_AVAILABLE_ORDERS = "FULFILL_AVAILABLE_ORDERS";
  export const FULFILL_AVAILABLE_ADVANCED_ORDERS =
    "FULFILL_AVAILABLE_ADVANCED_ORDERS";
  export const MATCH_ORDERS = "MATCH_ORDERS";
  export const MATCH_ADVANCED_ORDERS = "MATCH_ADVANCED_ORDERS";
}

// // Constants ported from Seaport contracts
// // See https://github.com/ProjectOpenSea/seaport/blob/main/contracts/lib/ConsiderationEnums.sol#L116
export namespace SeaportItemType {
  export const NATIVE = 0;
  export const ERC20 = 1;
  export const ERC721 = 2;
  export const ERC1155 = 3;
  export const ERC721_WITH_CRITERIA = 4;
  export const ERC1155_WITH_CRITERIA = 5;
}

export const BIGINT_ZERO = BigInt(0);
export const BIGDECIMAL_ZERO = 0;
// TODO to change
export const BIGDECIMAL_MAX = 10000000000000000000;
export const MANTISSA_FACTOR = Number(10 ** 18);
export const BIGDECIMAL_HUNDRED = 100;
export const SECONDS_PER_DAY = 24 * 60 * 60;

export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const ERC721_INTERFACE_IDENTIFIER = "0x80ac58cd";
export const ERC1155_INTERFACE_IDENTIFIER = "0xd9b67a26";

export function isMoney(itemType: number): boolean {
  return (
    itemType == SeaportItemType.NATIVE || itemType == SeaportItemType.ERC20
  );
}

export function isNFT(itemType: number): boolean {
  return (
    itemType == SeaportItemType.ERC721 ||
    itemType == SeaportItemType.ERC1155 ||
    itemType == SeaportItemType.ERC721_WITH_CRITERIA ||
    itemType == SeaportItemType.ERC1155_WITH_CRITERIA
  );
}

export function isERC721(itemType: number): boolean {
  return (
    itemType == SeaportItemType.ERC721 ||
    itemType == SeaportItemType.ERC721_WITH_CRITERIA
  );
}

export function isERC1155(itemType: number): boolean {
  return (
    itemType == SeaportItemType.ERC1155 ||
    itemType == SeaportItemType.ERC1155_WITH_CRITERIA
  );
}

export function isOpenSeaFeeAccount(address: string): boolean {
  const OPENSEA_WALLET_ADDRESS = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
  const OPENSEA_FEES_ACCOUNT = "0x8de9c5a032463c561423387a9648c5c7bcc5bc90";
  // This can be found https://github.com/web3w/seaport-js/blob/399fa568c04749fd8f96829fa7a6b73d1e440458/src/contracts/index.ts#L30
  const OPENSEA_ETHEREUM_FEE_COLLECTOR =
    "0x0000a26b00c1F0DF003000390027140000fAa719";
  return (
    address == OPENSEA_WALLET_ADDRESS ||
    address == OPENSEA_FEES_ACCOUNT ||
    address == OPENSEA_ETHEREUM_FEE_COLLECTOR
  );
}

export function orderFulfillmentMethod(
  event: OrderFulfilledLog
): string | undefined {
  const methodSignature = event.transaction.input.slice(0, 10).toUpperCase();
  let fulfillmentType: string | undefined = undefined;

  if (methodSignature == MethodSignatures.FULFILL_BASIC_ORDER.toUpperCase()) {
    fulfillmentType = OrderFulfillmentMethods.FULFILL_BASIC_ORDER;
  }

  if (methodSignature == MethodSignatures.FULFILL_ORDER) {
    fulfillmentType = OrderFulfillmentMethods.FULFILL_ORDER;
  }

  if (methodSignature == MethodSignatures.FULFILL_ADVANCED_ORDER) {
    fulfillmentType = OrderFulfillmentMethods.FULFILL_ADVANCED_ORDER;
  }

  if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ORDERS) {
    fulfillmentType = OrderFulfillmentMethods.FULFILL_AVAILABLE_ORDERS;
  }

  if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ADVANCED_ORDERS) {
    fulfillmentType = OrderFulfillmentMethods.FULFILL_AVAILABLE_ADVANCED_ORDERS;
  }

  if (methodSignature == MethodSignatures.MATCH_ORDERS) {
    fulfillmentType = OrderFulfillmentMethods.MATCH_ORDERS;
  }

  if (methodSignature == MethodSignatures.MATCH_ADVANCED_ORDERS) {
    fulfillmentType === OrderFulfillmentMethods.MATCH_ADVANCED_ORDERS;
  }

  return fulfillmentType;
}
export function tradeStrategy(event: OrderFulfilledLog): SaleStrategy {
  const methodSignature = event.transaction.input.slice(0, 10).toUpperCase();

  let strategy = SaleStrategy.STANDARD_SALE; // default to this
  if (methodSignature == MethodSignatures.FULFILL_BASIC_ORDER) {
    strategy = SaleStrategy.STANDARD_SALE;
  }

  if (methodSignature == MethodSignatures.FULFILL_ORDER) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  if (methodSignature == MethodSignatures.FULFILL_ADVANCED_ORDER) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ORDERS) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  if (methodSignature == MethodSignatures.FULFILL_AVAILABLE_ADVANCED_ORDERS) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  if (methodSignature == MethodSignatures.MATCH_ORDERS) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  if (methodSignature == MethodSignatures.MATCH_ADVANCED_ORDERS) {
    strategy = SaleStrategy.ANY_ITEM_FROM_SET;
  }

  return strategy;
}
