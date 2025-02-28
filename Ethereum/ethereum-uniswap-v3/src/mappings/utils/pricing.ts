// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ONE_BD, ZERO_BD, ZERO_BI } from "./constants";
import { Bundle, Pool, Token, WhiteListPools } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { exponentToBigDecimal, safeDiv, safeDivNumToNum } from "./index";
import { formatUnits, parseUnits } from "@ethersproject/units";
import assert from "assert";

const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC_WETH_03_POOL = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] = [
  WETH_ADDRESS, // WETH
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
  "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", // cDAI
  "0x39aa39c021dfbae8fac545936693ac917d5e7563", // cUSDC
  "0x86fadb80d8d2cff3c3680819e4da99c10232ba0f", // EBASE
  "0x57ab1ec28d129707052df4df418d58a2d46d5f51", // sUSD
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", // MKR
  "0xc00e94cb662c3520282e6f5717214004a7f26888", // COMP
  "0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
  "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", // SNX
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", // YFI
  "0x111111111117dc0aa78b770fa6a738034120c302", // 1INCH
  "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8", // yCurv
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca", // FEI
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", // MATIC
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // AAVE
  "0xfe2e637202056d30016725477c5da089ab0a043a", // sETH2
];

const STABLE_COINS: string[] = [
  "0x6b175474e89094c44da98b954eedeac495271d0f",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x0000000000085d4780b73119b644ae5ecd22b376",
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
  "0x4dd28568d05f09b02220b09c2cb307bfd837cb95",
];

const MINIMUM_ETH_LOCKED = BigNumber.from("60");

const Q192 = 2 ** 192;
export function sqrtPriceX96ToTokenPrices(
  sqrtPriceX96: bigint,
  token0: Token,
  token1: Token,
): number[] {
  const num = sqrtPriceX96 * sqrtPriceX96;
  const denom = BigInt(Q192);
  const divide = num / denom;
  const decimals = BigInt(
    Math.abs(Number(token1.decimals) - Number(token0.decimals)),
  );
  const price1 = Number(formatUnits(divide, decimals));

  const price0 = safeDivNumToNum(1, price1);
  return [price0, price1];
}

export async function getEthPriceInUSD(): Promise<BigNumber> {
  // fetch eth prices for each stablecoin
  const usdcPool = await Pool.get(USDC_WETH_03_POOL); // dai is token0
  if (usdcPool !== undefined) {
    return BigNumber.from(usdcPool.token0Price);
  } else {
    return ZERO_BD;
  }
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export async function findEthPerToken(token: Token): Promise<BigNumber> {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const whiteList: string[] = token.whitelistPoolsId

  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityETH = ZERO_BD;
  let priceSoFar = ZERO_BD;
  const bundle = await Bundle.get("1");

  const tokenWhitelist = await WhiteListPools.getByTokenId(token.id, {
    limit: 100,
  });
  // hardcoded fix for incorrect rates
  // if whitelist includes token - get the safe price
  assert(bundle);
  assert(tokenWhitelist);
  if (STABLE_COINS.includes(token.id)) {
    priceSoFar = safeDiv(ONE_BD, BigNumber.from(bundle.ethPriceUSD));
  } else {
    // get a list of whitelist For the matching token
    //
    for (let i = 0; i < tokenWhitelist.length; ++i) {
      const poolAddress = tokenWhitelist[i].poolId;
      const pool = await Pool.get(poolAddress);
      assert(pool);
      assert(pool.token0Id);
      assert(pool.token1Id);

      if (BigNumber.from(pool.liquidity).gt(ZERO_BI)) {
        if (pool.token0Id == token.id) {
          // whitelist token is token1
          const token1 = await Token.get(pool.token1Id);
          // get the derived ETH in pool
          assert(token1);
          const ethLocked = BigNumber.from(pool.totalValueLockedToken1).mul(
            token1.derivedETH,
          );
          if (
            ethLocked.gt(largestLiquidityETH) &&
            ethLocked.gt(MINIMUM_ETH_LOCKED)
          ) {
            largestLiquidityETH = ethLocked;
            // token1 per our token * Eth per token1
            priceSoFar = BigNumber.from(pool.token1Price).mul(
              token1.derivedETH,
            );
          }
        }
        if (pool.token1Id == token.id) {
          const token0 = await Token.get(pool.token0Id);
          assert(token0);
          // get the derived ETH in pool
          const ethLocked = BigNumber.from(pool.totalValueLockedToken0).mul(
            token0.derivedETH,
          );
          if (
            ethLocked.gt(largestLiquidityETH) &&
            ethLocked.gt(MINIMUM_ETH_LOCKED)
          ) {
            largestLiquidityETH = ethLocked;
            // token0 per our token * ETH per token0
            priceSoFar = BigNumber.from(pool.token0Price).mul(
              token0.derivedETH,
            );
          }
        }
      }
    }
  }
  return priceSoFar; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export async function getTrackedAmountUSD(
  tokenAmount0: BigNumber,
  token0: Token,
  tokenAmount1: BigNumber,
  token1: Token,
): Promise<BigNumber> {
  const bundle = await Bundle.get("1");
  assert(bundle);
  const price0USD = BigNumber.from(token0.derivedETH).mul(bundle.ethPriceUSD);
  const price1USD = BigNumber.from(token1.derivedETH).mul(bundle.ethPriceUSD);

  // both are whitelist tokens, return sum of both amounts
  if (
    WHITELIST_TOKENS.includes(token0.id) &&
    WHITELIST_TOKENS.includes(token1.id)
  ) {
    return tokenAmount0.mul(price0USD).add(tokenAmount1.mul(price1USD));
  }

  // take double value of the whitelisted token amount
  if (
    WHITELIST_TOKENS.includes(token0.id) &&
    !WHITELIST_TOKENS.includes(token1.id)
  ) {
    return tokenAmount0.mul(price0USD).mul(BigNumber.from("2"));
  }

  // take double value of the whitelisted token amount
  if (
    !WHITELIST_TOKENS.includes(token0.id) &&
    WHITELIST_TOKENS.includes(token1.id)
  ) {
    return tokenAmount1.mul(price1USD).mul(BigNumber.from("2"));
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD;
}
