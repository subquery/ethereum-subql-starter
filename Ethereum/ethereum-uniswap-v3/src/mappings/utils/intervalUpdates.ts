// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ZERO_BD, ZERO_BI, ONE_BI, FACTORY_ADDRESS } from "./constants";
import {
  UniswapDayData,
  Factory,
  Pool,
  PoolDayData,
  Token,
  TokenDayData,
  TokenHourData,
  Bundle,
  PoolHourData,
  TickDayData,
  Tick,
} from "../../types";
import { EthereumLog } from "@subql/types-ethereum";
import { BigNumber } from "@ethersproject/bignumber";

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
// TODO : event type ?
export async function updateUniswapDayData(
  event: EthereumLog
): Promise<UniswapDayData> {
  const timestamp = parseInt(event.block.timestamp.toString());
  const dayID = timestamp / 86400; // rounded
  const dayStartTimestamp = Number(event.block.timestamp);

  let [uniswap, uniswapDayData] = await Promise.all([
    Factory.get(FACTORY_ADDRESS),
    UniswapDayData.get(dayID.toString()),
  ]);
  if (uniswapDayData === undefined) {
    uniswapDayData = UniswapDayData.create({
      id: dayID.toString(),
      date: dayStartTimestamp,
      volumeETH: 0,
      volumeUSD: 0,
      volumeUSDUntracked: 0,
      feesUSD: 0,
      tvlUSD: uniswap.totalValueLockedUSD,
      txCount: uniswap.txCount,
    });
  }
  await uniswapDayData.save();
  return uniswapDayData;
}

export async function updatePoolDayData(
  event: EthereumLog
): Promise<PoolDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const dayPoolID = `${event.address}-${dayID.toString()}`;
  let [pool, poolDayData] = await Promise.all([
    Pool.get(event.address),
    PoolDayData.get(dayPoolID),
  ]);

  if (poolDayData === undefined) {
    poolDayData = new PoolDayData(dayPoolID);
    poolDayData.date = dayStartTimestamp.toNumber();
    poolDayData.poolId = pool.id;
    // things that dont get initialized always
    poolDayData.volumeToken0 = 0;
    poolDayData.volumeToken1 = 0;
    poolDayData.volumeUSD = 0;
    poolDayData.feesUSD = 0;
    poolDayData.txCount = ZERO_BI;
    poolDayData.feeGrowthGlobal0X128 = ZERO_BI;
    poolDayData.feeGrowthGlobal1X128 = ZERO_BI;
    poolDayData.open = pool.token0Price;
    poolDayData.high = pool.token0Price;
    poolDayData.low = pool.token0Price;
    poolDayData.close = pool.token0Price;
  }

  if (pool.token0Price > poolDayData.high) {
    poolDayData.high = pool.token0Price;
  }
  if (pool.token0Price < poolDayData.low) {
    poolDayData.low = pool.token0Price;
  }

  poolDayData.liquidity = pool.liquidity;
  poolDayData.sqrtPrice = pool.sqrtPrice;
  poolDayData.feeGrowthGlobal0X128 = pool.feeGrowthGlobal0X128;
  poolDayData.feeGrowthGlobal1X128 = pool.feeGrowthGlobal1X128;
  poolDayData.token0Price = pool.token0Price;
  poolDayData.token1Price = pool.token1Price;
  poolDayData.tick = pool.tick;
  poolDayData.tvlUSD = pool.totalValueLockedUSD;
  poolDayData.txCount = poolDayData.txCount + ONE_BI;
  await poolDayData.save();

  return poolDayData;
}

export async function updatePoolHourData(
  event: EthereumLog
): Promise<PoolHourData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const hourIndex = timestamp.div(3600); // get unique hour within unix history
  const hourStartUnix = hourIndex.mul(3600); // want the rounded effect
  const hourPoolID = event.address
    // .toHexString()
    .concat("-")
    .concat(hourIndex.toString());
  let [pool, poolHourData] = await Promise.all([
    await Pool.get(event.address),
    await PoolHourData.get(hourPoolID),
  ]);
  if (poolHourData === undefined) {
    poolHourData = new PoolHourData(hourPoolID);
    poolHourData = new PoolHourData(hourPoolID);
    poolHourData.periodStartUnix = hourStartUnix.toNumber();
    poolHourData.poolId = pool.id;
    // things that dont get initialized always
    poolHourData.volumeToken0 = 0;
    poolHourData.volumeToken1 = 0;
    poolHourData.volumeUSD = 0;
    poolHourData.txCount = ZERO_BI;
    poolHourData.feesUSD = 0;
    poolHourData.feeGrowthGlobal0X128 = ZERO_BI;
    poolHourData.feeGrowthGlobal1X128 = ZERO_BI;
    poolHourData.open = pool.token0Price;
    poolHourData.high = pool.token0Price;
    poolHourData.low = pool.token0Price;
    poolHourData.close = pool.token0Price;
  }

  if (pool.token0Price > poolHourData.high) {
    poolHourData.high = pool.token0Price;
  }
  if (pool.token0Price < poolHourData.low) {
    poolHourData.low = pool.token0Price;
  }
  poolHourData.liquidity = pool.liquidity;
  poolHourData.sqrtPrice = pool.sqrtPrice;
  poolHourData.token0Price = pool.token0Price;
  poolHourData.token1Price = pool.token1Price;
  poolHourData.feeGrowthGlobal0X128 = pool.feeGrowthGlobal0X128;
  poolHourData.feeGrowthGlobal1X128 = pool.feeGrowthGlobal1X128;
  poolHourData.close = pool.token0Price;
  poolHourData.tick = pool.tick;
  poolHourData.tvlUSD = pool.totalValueLockedUSD;
  poolHourData.txCount = poolHourData.txCount + ONE_BI;

  await poolHourData.save();

  // test
  return poolHourData;
}

export async function updateTokenDayData(
  token: Token,
  event: EthereumLog
): Promise<TokenDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const tokenDayID = token.id.toString().concat("-").concat(dayID.toString());

  let [tokenDayData, bundle] = await Promise.all([
    TokenDayData.get(tokenDayID),
    Bundle.get("1"),
  ]);
  const tokenPrice = token.derivedETH * bundle.ethPriceUSD;

  if (tokenDayData === undefined) {
    tokenDayData = new TokenDayData(tokenDayID);
    tokenDayData.date = dayStartTimestamp.toNumber();
    tokenDayData.tokenId = token.id;
    tokenDayData.volume = 0;
    tokenDayData.volumeUSD = 0;
    tokenDayData.feesUSD = 0;
    tokenDayData.untrackedVolumeUSD = 0;
    tokenDayData.open = tokenPrice;
    tokenDayData.high = tokenPrice;
    tokenDayData.low = tokenPrice;
    tokenDayData.close = tokenPrice;
  }

  if (tokenPrice > tokenDayData.high) {
    tokenDayData.high = tokenPrice;
  }

  if (tokenPrice < tokenDayData.low) {
    tokenDayData.low = tokenPrice;
  }

  tokenDayData.close = tokenPrice;
  tokenDayData.priceUSD = token.derivedETH * bundle.ethPriceUSD;
  tokenDayData.totalValueLocked = token.totalValueLocked;
  tokenDayData.totalValueLockedUSD = token.totalValueLockedUSD;
  await tokenDayData.save();

  return tokenDayData;
}

export async function updateTokenHourData(
  token: Token,
  event: EthereumLog
): Promise<TokenHourData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const hourIndex = timestamp.div(3600); // get unique hour within unix history
  const hourStartUnix = hourIndex.mul(3600); // want the rounded effect
  const tokenHourID = token.id
    .toString()
    .concat("-")
    .concat(hourIndex.toString());
  let [tokenHourData, bundle] = await Promise.all([
    TokenHourData.get(tokenHourID),
    Bundle.get("1"),
  ]);
  const tokenPrice = BigNumber.from(token.derivedETH).mul(bundle.ethPriceUSD);
  if (tokenHourData === undefined) {
    tokenHourData = new TokenHourData(tokenHourID);
    tokenHourData.periodStartUnix = hourStartUnix.toNumber();
    tokenHourData.tokenId = token.id;
    tokenHourData.volume = 0;
    tokenHourData.volumeUSD = 0;
    tokenHourData.untrackedVolumeUSD = 0;
    tokenHourData.feesUSD = 0;
    tokenHourData.open = tokenPrice.toNumber();
    tokenHourData.high = tokenPrice.toNumber();
    tokenHourData.low = tokenPrice.toNumber();
    tokenHourData.close = tokenPrice.toNumber();
  }

  if (tokenPrice.gt(tokenHourData.high)) {
    tokenHourData.high = tokenPrice.toNumber();
  }

  if (tokenPrice.lt(tokenHourData.low)) {
    tokenHourData.low = tokenPrice.toNumber();
  }

  tokenHourData.close = tokenPrice.toNumber();
  tokenHourData.priceUSD = tokenPrice.toNumber();
  tokenHourData.totalValueLocked = token.totalValueLocked;
  tokenHourData.totalValueLockedUSD = token.totalValueLockedUSD;
  await tokenHourData.save();

  return tokenHourData;
}

export async function updateTickDayData(
  tick: Tick,
  event: EthereumLog
): Promise<TickDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const tickDayDataID = tick.id.concat("-").concat(dayID.toString());
  let tickDayData = await TickDayData.get(tickDayDataID);
  if (tickDayData === undefined) {
    tickDayData = new TickDayData(tickDayDataID);
    tickDayData.date = dayStartTimestamp.toNumber();
    tickDayData.poolId = tick.poolId;
    tickDayData.tickId = tick.id;
  }
  tickDayData.liquidityGross = tick.liquidityGross;
  tickDayData.liquidityNet = tick.liquidityNet;
  tickDayData.volumeToken0 = tick.volumeToken0;
  tickDayData.volumeToken1 = tick.volumeToken0;
  tickDayData.volumeUSD = tick.volumeUSD;
  tickDayData.feesUSD = tick.feesUSD;
  tickDayData.feeGrowthOutside0X128 = tick.feeGrowthOutside0X128;
  tickDayData.feeGrowthOutside1X128 = tick.feeGrowthOutside1X128;

  await tickDayData.save();

  return tickDayData;
}
