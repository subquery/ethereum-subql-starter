// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ONE_BD, ZERO_BD, ZERO_BI } from "./constants";
import { Bundle, Pool, Token, WhiteListPools } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { exponentToBigDecimal, safeDiv, safeDivNumToNum } from "./index";
import { formatUnits, parseUnits } from "@ethersproject/units";
import assert from "assert";

const WETH_ADDRESS = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
const USDC_WETH_03_POOL = "0x36696169c63e42cd08ce11f5deebbcebae652050";

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] =
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c,0x55d398326f99059ff775485246999027b3197955,0xe9e7cea3dedca5984780bafc599bd69add087d56,0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d,0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c,0x2170ed0880ac9a755fd29b2688956bd959f933f8,0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82".split(
    ",",
  );

const STABLE_COINS: string[] =
  "0x55d398326f99059ff775485246999027b3197955,0xe9e7cea3dedca5984780bafc599bd69add087d56,0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d".split(
    ",",
  );

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

  const tokenWhitelist = await WhiteListPools.getByTokenId(token.id, {limit: 100});
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
