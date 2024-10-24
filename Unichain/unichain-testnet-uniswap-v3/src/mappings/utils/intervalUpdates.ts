// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ZERO_BD, ZERO_BI, ONE_BI, FACTORY_ADDRESS } from "./constants";
import {
  PancakeSwapDayData,
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
import assert from "assert";

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
// TODO : event type ?
export async function updatePancakeSwapDayData(
  event: EthereumLog,
): Promise<PancakeSwapDayData> {
  const timestamp = parseInt(event.block.timestamp.toString());
  const dayID = timestamp / 86400; // rounded
  const dayStartTimestamp = Number(event.block.timestamp);

  let [pancakeSwap, pancakeSwapDayData] = await Promise.all([
    Factory.get(FACTORY_ADDRESS),
    PancakeSwapDayData.get(dayID.toString()),
  ]);
  assert(pancakeSwap);
  if (pancakeSwapDayData === undefined) {
    pancakeSwapDayData = PancakeSwapDayData.create({
      id: dayID.toString(),
      date: dayStartTimestamp,
      volumeETH: 0,
      volumeUSD: 0,
      volumeUSDUntracked: 0,
      feesUSD: 0,
      tvlUSD: pancakeSwap.totalValueLockedUSD,
      txCount: pancakeSwap.txCount,
    });
  }
  await pancakeSwapDayData.save();
  return pancakeSwapDayData;
}

export async function updatePoolDayData(
  event: EthereumLog,
): Promise<PoolDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const dayPoolID = `${event.address}-${dayID.toString()}`;
  let [pool, poolDayData] = await Promise.all([
    Pool.get(event.address),
    PoolDayData.get(dayPoolID),
  ]);
  assert(pool);
  if (poolDayData === undefined) {
    poolDayData = PoolDayData.create({
      id: dayPoolID,
      date: dayStartTimestamp.toNumber(),
      poolId: pool.id,
      // things that dont get initialized always
      volumeToken0: 0,
      volumeToken1: 0,
      volumeUSD: 0,
      feesUSD: 0,
      txCount: ZERO_BI,
      feeGrowthGlobal0X128: ZERO_BI,
      feeGrowthGlobal1X128: ZERO_BI,
      open: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token0Price,
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      tvlUSD: pool.totalValueLockedUSD,
    });
  }

  if (pool.token0Price > poolDayData.high) {
    poolDayData.high = pool.token0Price;
  }
  if (pool.token0Price < poolDayData.low) {
    poolDayData.low = pool.token0Price;
  }

  poolDayData.txCount = poolDayData.txCount + ONE_BI;

  await poolDayData.save();

  return poolDayData;
}

export async function updatePoolHourData(
  event: EthereumLog,
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
  assert(pool);
  if (poolHourData === undefined) {
    poolHourData = PoolHourData.create({
      id: hourPoolID,
      periodStartUnix: hourStartUnix.toNumber(),
      poolId: pool.id,
      // things that dont get initialized always
      volumeToken0: 0,
      volumeToken1: 0,
      volumeUSD: 0,
      feesUSD: 0,
      txCount: ZERO_BI,
      feeGrowthGlobal0X128: ZERO_BI,
      feeGrowthGlobal1X128: ZERO_BI,
      open: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token0Price,
      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      tvlUSD: pool.totalValueLockedUSD,
    });
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
  event: EthereumLog,
): Promise<TokenDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const tokenDayID = token.id.toString().concat("-").concat(dayID.toString());

  let [tokenDayData, bundle] = await Promise.all([
    TokenDayData.get(tokenDayID),
    Bundle.get("1"),
  ]);
  assert(bundle);
  const tokenPrice = token.derivedETH * bundle.ethPriceUSD;

  if (tokenDayData === undefined) {
    tokenDayData = TokenDayData.create({
      id: tokenDayID,
      date: dayStartTimestamp.toNumber(),
      tokenId: token.id,
      volume: 0,
      volumeUSD: 0,
      feesUSD: 0,
      untrackedVolumeUSD: 0,
      open: tokenPrice,
      high: tokenPrice,
      low: tokenPrice,
      close: tokenPrice,
      priceUSD: token.derivedETH * bundle.ethPriceUSD,
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
    });
  }

  if (tokenPrice > tokenDayData.high) {
    tokenDayData.high = tokenPrice;
  }

  if (tokenPrice < tokenDayData.low) {
    tokenDayData.low = tokenPrice;
  }

  await tokenDayData.save();

  return tokenDayData;
}

export async function updateTokenHourData(
  token: Token,
  event: EthereumLog,
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
  assert(bundle);
  const tokenPrice = BigNumber.from(token.derivedETH).mul(bundle.ethPriceUSD);
  if (tokenHourData === undefined) {
    tokenHourData = TokenHourData.create({
      id: tokenHourID,
      periodStartUnix: hourStartUnix.toNumber(),
      tokenId: token.id,
      volume: 0,
      volumeUSD: 0,
      untrackedVolumeUSD: 0,
      feesUSD: 0,
      open: tokenPrice.toNumber(),
      high: tokenPrice.toNumber(),
      low: tokenPrice.toNumber(),
      close: tokenPrice.toNumber(),
      totalValueLocked: token.totalValueLocked,
      totalValueLockedUSD: token.totalValueLockedUSD,
      priceUSD: tokenPrice.toNumber(),
    });
  }

  if (tokenPrice.gt(tokenHourData.high)) {
    tokenHourData.high = tokenPrice.toNumber();
  }

  if (tokenPrice.lt(tokenHourData.low)) {
    tokenHourData.low = tokenPrice.toNumber();
  }

  await tokenHourData.save();

  return tokenHourData;
}

export async function updateTickDayData(
  tick: Tick,
  event: EthereumLog,
): Promise<TickDayData> {
  const timestamp = BigNumber.from(event.block.timestamp);
  const dayID = timestamp.div(86400);
  const dayStartTimestamp = dayID.mul(86400);
  const tickDayDataID = tick.id.concat("-").concat(dayID.toString());
  let tickDayData = await TickDayData.get(tickDayDataID);
  if (tickDayData === undefined) {
    tickDayData = TickDayData.create({
      id: tickDayDataID,
      date: dayStartTimestamp.toNumber(),
      poolId: tick.poolId,
      tickId: tick.id,
      liquidityGross: tick.liquidityGross,
      liquidityNet: tick.liquidityNet,
      volumeToken0: tick.volumeToken0,
      volumeToken1: tick.volumeToken0,
      volumeUSD: tick.volumeUSD,
      feesUSD: tick.feesUSD,
      feeGrowthOutside0X128: tick.feeGrowthOutside0X128,
      feeGrowthOutside1X128: tick.feeGrowthOutside1X128,
    });
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
