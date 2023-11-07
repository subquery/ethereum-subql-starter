// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Bundle, Burn, Factory, Mint, Pool, Swap, Tick, Token } from "../types";
import {
  FACTORY_ADDRESS,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
  convertTokenToDecimal,
  loadTransaction,
  safeDiv,
  findEthPerToken,
  getEthPriceInUSD,
  getTrackedAmountUSD,
  sqrtPriceX96ToTokenPrices,
  updatePoolDayData,
  updatePoolHourData,
  updateTickDayData,
  updateTokenDayData,
  updateTokenHourData,
  updateUniswapDayData,
  createTick,
  feeTierToTickSpacing,
} from "./utils";
import { EthereumLog } from "@subql/types-ethereum";
import { BigNumber } from "@ethersproject/bignumber";
import {
  InitializeEvent,
  MintEvent,
  BurnEvent,
  SwapEvent,
  FlashEvent,
} from "../types/contracts/Pool";
import { Pool__factory } from "../types/contracts/factories/Pool__factory";
import assert from "assert";
import {InitializeLog, MintLog, SwapLog, SwapTransaction} from "../types/abi-interfaces/Pool";

export async function handleInitialize(
  event: InitializeLog
): Promise<void> {
  const [pool, ethPrice] = await Promise.all([
    Pool.get(event.address),
    getEthPriceInUSD(),
  ]);
  assert(pool);
  assert(event.args);
  pool.sqrtPrice = event.args.sqrtPriceX96.toBigInt();
  pool.tick = BigNumber.from(event.args.tick).toBigInt();
  assert(pool.token0Id);
  assert(pool.token1Id);

  // update token prices
  const [token0, token1] = await Promise.all([
    Token.get(pool.token0Id),
    Token.get(pool.token1Id),
  ]);
  const bundle = await Bundle.get("1");
  assert(bundle);
  bundle.ethPriceUSD = ethPrice.toNumber();

  await Promise.all([updatePoolDayData(event), updatePoolHourData(event)]);

  assert(token0);
  assert(token1);
  const [derivedETH0, derivedETH1] = await Promise.all([
    findEthPerToken(token0),
    findEthPerToken(token1),
  ]);

  // update token prices
  token0.derivedETH = derivedETH0.toNumber();
  token1.derivedETH = derivedETH1.toNumber();

  await Promise.all([pool.save(), bundle.save(), token0.save(), token1.save()]);
  // update ETH price now that prices could have changed
}

export async function handleMint(
  event: MintLog
): Promise<void> {

  const poolAddress = event.address;
  const pool = await Pool.get(poolAddress);

  if (pool === undefined || pool === null) {
    logger.warn(
      `Could not get pool address ${poolAddress} for mint at transaction ${event.transactionHash}, log id ${event.logIndex}`
    );
    return;
  }

  assert(pool.token0Id);
  assert(pool.token1Id);
  const [bundle, factory, token0, token1, transaction] = await Promise.all([
    Bundle.get("1"),
    Factory.get(FACTORY_ADDRESS),
    Token.get(pool.token0Id),
    Token.get(pool.token1Id),
    loadTransaction(event),
  ]);

  assert(event.args);
  assert(token0);
  assert(token1);
  assert(bundle);
  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  const amount1 = convertTokenToDecimal(event.args.amount1, token1.decimals);

  const amountUSD =
    amount0.toNumber() * (token0.derivedETH * bundle.ethPriceUSD) +
    amount1.toNumber() * (token1.derivedETH * bundle.ethPriceUSD);

  assert(factory);
  // reset tvl aggregates until new amounts calculated
  factory.totalValueLockedETH =
    factory.totalValueLockedETH - pool.totalValueLockedETH;

  // update globals
  factory.txCount = factory.txCount + ONE_BI;

  // update token0 data
  token0.txCount = token0.txCount + ONE_BI;
  token0.totalValueLocked = token0.totalValueLocked + amount0.toNumber();
  token0.totalValueLockedUSD =
    token0.totalValueLocked * token0.derivedETH * bundle.ethPriceUSD;

  // update token1 data
  token1.txCount = token1.txCount + ONE_BI;
  token1.totalValueLocked = token1.totalValueLocked + amount1.toNumber();
  token1.totalValueLockedUSD =
    token1.totalValueLocked * token1.derivedETH * bundle.ethPriceUSD;

  // pool data
  pool.txCount = pool.txCount + ONE_BI;

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  if (
    pool.tick !== undefined &&
    BigNumber.from(event.args.tickLower).lte(pool.tick) &&
    BigNumber.from(event.args.tickUpper).gt(pool.tick)
  ) {
    pool.liquidity = pool.liquidity + event.args.amount.toBigInt();
  }

  pool.totalValueLockedToken0 =
    pool.totalValueLockedToken0 + amount0.toNumber();
  pool.totalValueLockedToken1 =
    pool.totalValueLockedToken1 + amount1.toNumber();
  pool.totalValueLockedETH =
    pool.totalValueLockedToken0 * token0.derivedETH +
    pool.totalValueLockedToken1 * token1.derivedETH;
  pool.totalValueLockedUSD = pool.totalValueLockedETH + bundle.ethPriceUSD;

  // reset aggregates with new amounts
  factory.totalValueLockedETH =
    factory.totalValueLockedETH + pool.totalValueLockedETH;
  factory.totalValueLockedUSD =
    factory.totalValueLockedETH + bundle.ethPriceUSD;

  const mint = Mint.create({
    id: transaction.id.toString() + "#" + pool.txCount.toString(),
    transactionId: transaction.id,
    timestamp: transaction.timestamp,
    poolId: pool.id,
    token0Id: pool.token0Id,
    token1Id: pool.token1Id,
    owner: event.args.owner,
    sender: event.args.sender,
    origin: event.transaction.from,
    amount: event.args.amount.toBigInt(),
    amount0: amount0.toNumber(),
    amount1: amount1.toNumber(),
    amountUSD: amountUSD,
    tickLower: BigInt(event.args.tickLower),
    tickUpper: BigInt(event.args.tickUpper),
    logIndex: BigInt(event.logIndex),
  });

  // tick entities
  const lowerTickIdx = event.args.tickLower;
  const upperTickIdx = event.args.tickUpper;
  const lowerTickId = poolAddress + "#" + event.args.tickLower;
  const upperTickId = poolAddress + "#" + event.args.tickUpper;

  let [lowerTick, upperTick] = await Promise.all([
    Tick.get(lowerTickId),
    Tick.get(upperTickId),
  ]);

  if (lowerTick === null || lowerTick === undefined) {
    lowerTick = createTick(lowerTickId, lowerTickIdx, pool.id, event);
  }

  if (upperTick === null || upperTick === undefined) {
    upperTick = createTick(upperTickId, upperTickIdx, pool.id, event);
  }

  const amount = event.args.amount;
  lowerTick.liquidityGross = lowerTick.liquidityGross + amount.toBigInt();
  lowerTick.liquidityNet = lowerTick.liquidityNet + amount.toBigInt();
  upperTick.liquidityGross = upperTick.liquidityGross + amount.toBigInt();
  upperTick.liquidityNet = upperTick.liquidityNet - amount.toBigInt();

  // TODO: Update Tick's volume, fees, and liquidity provider count. Computing these on the tick
  // level requires reimplementing some of the swapping code from v3-core.

  await Promise.all([
    updateUniswapDayData(event),
    updatePoolDayData(event),
    updatePoolHourData(event),
    updateTokenDayData(token0, event),
    updateTokenDayData(token1, event),
    updateTokenHourData(token0, event),
    updateTokenHourData(token1, event),

    token0.save(),
    token1.save(),
    pool.save(),
    factory.save(),
    mint.save(),

    // Update inner tick vars and save the ticks
    updateTickFeeVarsAndSave(lowerTick, event),
    updateTickFeeVarsAndSave(upperTick, event),
  ]);
}

export async function handleBurn(
  event: EthereumLog<BurnEvent["args"]>
): Promise<void> {
  const poolAddress = event.address;
  const pool = await Pool.get(poolAddress);
  assert(pool?.token0Id);
  assert(pool?.token1Id);

  const [bundle, factory, token0, token1, transaction] = await Promise.all([
    Bundle.get("1"),
    Factory.get(FACTORY_ADDRESS),
    Token.get(pool.token0Id),
    Token.get(pool.token1Id),
    loadTransaction(event),
  ]);
  assert(event.args);
  assert(token0);
  assert(token1);

  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  const amount1 = convertTokenToDecimal(event.args.amount1, token1.decimals);
  assert(bundle);

  const amountUSD =
    amount0.toNumber() * token0.derivedETH * bundle.ethPriceUSD +
    amount1.toNumber() * token1.derivedETH * bundle.ethPriceUSD;

  assert(factory);
  // reset tvl aggregates until new amounts calculated
  factory.totalValueLockedETH =
    factory.totalValueLockedETH - pool.totalValueLockedETH;

  // update globals
  factory.txCount = factory.txCount + ONE_BI;

  // update token0 data
  token0.txCount = token0.txCount + ONE_BI;
  token0.totalValueLocked = token0.totalValueLocked - amount0.toNumber();
  token0.totalValueLockedUSD =
    token0.totalValueLocked * token0.derivedETH * bundle.ethPriceUSD;

  // update token1 data
  token1.txCount = token1.txCount + ONE_BI;
  token1.totalValueLocked = token1.totalValueLocked - amount1.toNumber();
  token1.totalValueLockedUSD =
    token1.totalValueLocked * token1.derivedETH * bundle.ethPriceUSD;

  // pool data
  pool.txCount = pool.txCount + ONE_BI;
  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on burn if the position being burnt includes the current tick.
  if (
    pool.tick !== undefined &&
    BigNumber.from(event.args.tickLower).lte(pool.tick) &&
    BigNumber.from(event.args.tickUpper).gt(pool.tick)
  ) {
    pool.liquidity = pool.liquidity - event.args.amount.toBigInt();
  }

  pool.totalValueLockedToken0 =
    pool.totalValueLockedToken0 - amount0.toNumber();
  pool.totalValueLockedToken1 =
    pool.totalValueLockedToken1 - amount1.toNumber();
  pool.totalValueLockedETH =
    pool.totalValueLockedToken0 * token0.derivedETH +
    pool.totalValueLockedToken1 * token1.derivedETH;
  pool.totalValueLockedUSD = pool.totalValueLockedETH * bundle.ethPriceUSD;

  // reset aggregates with new amounts
  factory.totalValueLockedETH =
    factory.totalValueLockedETH * pool.totalValueLockedETH;
  factory.totalValueLockedUSD =
    factory.totalValueLockedETH * bundle.ethPriceUSD;

  // burn entity
  // const transaction = await loadTransaction(event)
  const burn = Burn.create({
    id: transaction.id + "#" + pool.txCount.toString(),
    transactionId: transaction.id,
    timestamp: transaction.timestamp,
    poolId: pool.id,
    token0Id: pool.token0Id,
    token1Id: pool.token1Id,
    owner: event.args.owner,
    origin: event.transaction.from,
    amount: event.args.amount.toBigInt(),
    amount0: amount0.toNumber(),
    amount1: amount1.toNumber(),
    amountUSD: amountUSD,
    tickLower: BigInt(event.args.tickLower),
    tickUpper: BigInt(event.args.tickUpper),
    logIndex: BigInt(event.logIndex),
  });

  // tick entities
  const lowerTickId = poolAddress + "#" + event.args.tickLower;
  const upperTickId = poolAddress + "#" + event.args.tickUpper;
  const [lowerTick, upperTick] = await Promise.all([
    Tick.get(lowerTickId),
    Tick.get(upperTickId),
  ]);
  const amount = event.args.amount;
  assert(lowerTick);
  assert(upperTick);
  lowerTick.liquidityGross = lowerTick.liquidityGross - amount.toBigInt();
  lowerTick.liquidityNet = lowerTick.liquidityNet - amount.toBigInt();
  upperTick.liquidityGross = upperTick.liquidityGross - amount.toBigInt();
  upperTick.liquidityNet = upperTick.liquidityNet + amount.toBigInt();

  await Promise.all([
    updateUniswapDayData(event),
    updatePoolDayData(event),
    updatePoolHourData(event),
    updateTokenDayData(token0, event),
    updateTokenDayData(token1, event),
    updateTokenHourData(token0, event),
    updateTokenHourData(token1, event),
    updateTickFeeVarsAndSave(lowerTick, event),
    updateTickFeeVarsAndSave(upperTick, event),
    token0.save(),
    token1.save(),
    pool.save(),
    factory.save(),
    burn.save(),
  ]);
}

export async function handleSwap(
  event: SwapLog
): Promise<void> {
  const poolContract = Pool__factory.connect(event.address, api);
  const [
    bundle,
    factory,
    pool,
    transaction,
    ethPrice,
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
  ] = await Promise.all([
    Bundle.get("1"),
    Factory.get(FACTORY_ADDRESS),
    Pool.get(event.address),
    loadTransaction(event),
    getEthPriceInUSD(),
    poolContract.feeGrowthGlobal0X128(),
    poolContract.feeGrowthGlobal1X128(),
  ]);
  assert(pool);


  // hot fix for bad pricing
  if (pool.id == "0x9663f2ca0454accad3e094448ea6f77443880454") {
    return;
  }
  assert(pool.token0Id);
  assert(pool.token1Id);

  const [token0, token1] = await Promise.all([
    Token.get(pool.token0Id),
    Token.get(pool.token1Id),
  ]);
  const oldTick = pool.tick;
  assert(event.args);
  assert(token0);
  assert(token1);

  // amounts - 0/1 are token deltas: can be positive or negative
  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  const amount1 = convertTokenToDecimal(event.args.amount1, token1.decimals);

  // need absolute amounts for volume
  let amount0Abs = amount0;
  if (amount0.lt(ZERO_BD)) {
    amount0Abs = amount0.mul(BigNumber.from("-1"));
  }

  let amount1Abs = amount1;
  if (amount1.lt(ZERO_BD)) {
    amount1Abs = amount1.mul(BigNumber.from("-1"));
  }
  assert(bundle);

  const amount0ETH = amount0Abs.mul(token0.derivedETH);
  const amount1ETH = amount1Abs.mul(token1.derivedETH);
  const amount0USD = amount0ETH.mul(bundle.ethPriceUSD);
  const amount1USD = amount1ETH.mul(bundle.ethPriceUSD);

  // get amount that should be tracked only - div 2 because cant count both input and output as volume
  const amountTotalUSDTracked = (
    await getTrackedAmountUSD(amount0Abs, token0, amount1Abs, token1)
  ).div(BigNumber.from("2"));
  const amountTotalETHTracked = safeDiv(
    amountTotalUSDTracked,
    BigNumber.from(bundle.ethPriceUSD)
  );
  const amountTotalUSDUntracked = amount0USD
    .add(amount1USD)
    .div(BigNumber.from("2"));

  const feesETH = amountTotalETHTracked
    .mul(pool.feeTier)
    .div(BigNumber.from("1000000"));
  const feesUSD = amountTotalUSDTracked
    .mul(pool.feeTier)
    .div(BigNumber.from("1000000"));

  assert(factory);
  // global updates
  factory.txCount = factory.txCount + ONE_BI; //BigNumber.from(factory.txCount).add(ONE_BI).toBigInt()
  factory.totalVolumeETH =
    factory.totalVolumeETH + amountTotalETHTracked.toNumber(); //BigNumber.from(factory.totalVolumeETH).add(amountTotalETHTracked).toNumber()
  factory.totalVolumeUSD =
    factory.totalVolumeUSD + amountTotalUSDTracked.toNumber(); // BigNumber.from(factory.totalVolumeUSD).add(amountTotalUSDTracked).toNumber()
  factory.untrackedVolumeUSD =
    factory.untrackedVolumeUSD + amountTotalUSDUntracked.toNumber(); // BigNumber.from(factory.untrackedVolumeUSD).add(amountTotalUSDUntracked).toNumber()
  factory.totalFeesETH = factory.totalFeesETH + feesETH.toNumber(); // BigNumber.from(factory.totalFeesETH).add(feesETH).toNumber()
  factory.totalFeesUSD = factory.totalFeesUSD + feesUSD.toNumber(); // BigNumber.from(factory.totalFeesUSD).add(feesUSD).toNumber()

  // reset aggregate tvl before individual pool tvl updates
  // const currentPoolTvlETH = pool.totalValueLockedETH
  factory.totalValueLockedETH =
    factory.totalValueLockedETH - pool.totalValueLockedETH; //BigNumber.from(factory.totalValueLockedETH).sub(currentPoolTvlETH).toNumber()

  // pool volume
  pool.volumeToken0 = pool.volumeToken0 + amount0Abs.toNumber(); //BigNumber.from(pool.volumeToken0).add(amount0Abs).toNumber()
  pool.volumeToken1 = pool.volumeToken1 + amount1Abs.toNumber(); //BigNumber.from(pool.volumeToken1).add(amount1Abs).toNumber()
  pool.volumeUSD = pool.volumeUSD + amountTotalUSDTracked.toNumber();
  pool.untrackedVolumeUSD =
    pool.untrackedVolumeUSD + amountTotalUSDUntracked.toNumber();
  pool.feesUSD = pool.feesUSD + feesUSD.toNumber(); //BigNumber.from(pool.feesUSD).add(feesUSD).toNumber()
  pool.txCount = pool.txCount + ONE_BI; //BigNumber.from(pool.txCount).add(ONE_BI).toBigInt()

  // Update the pool with the new active liquidity, price, and tick.
  pool.liquidity = event.args.liquidity.toBigInt();
  pool.tick = BigInt(event.args.tick);
  pool.sqrtPrice = event.args.sqrtPriceX96.toBigInt();
  pool.totalValueLockedToken0 =
    pool.totalValueLockedToken0 + amount0.toNumber(); // BigNumber.from(pool.totalValueLockedToken0).add(amount0).toNumber()
  pool.totalValueLockedToken1 =
    pool.totalValueLockedToken1 + amount1.toNumber(); // BigNumber.from(pool.totalValueLockedToken1).add(amount1).toNumber()

  // update token0 data
  token0.volume = token0.volume + amount0Abs.toNumber();
  token0.totalValueLocked = token0.totalValueLocked + amount0.toNumber();
  token0.volumeUSD = token0.volumeUSD + amountTotalUSDTracked.toNumber();
  token0.untrackedVolumeUSD =
    token0.untrackedVolumeUSD + amountTotalUSDUntracked.toNumber();
  token0.feesUSD = token0.feesUSD + feesUSD.toNumber();
  token0.txCount = token0.txCount + ONE_BI;

  // update token1 data
  token1.volume = token1.volume + amount1Abs.toNumber();
  token1.totalValueLocked = token1.totalValueLocked + amount1.toNumber();
  token1.volumeUSD = token1.volumeUSD + amountTotalUSDTracked.toNumber();
  token1.untrackedVolumeUSD =
    token1.untrackedVolumeUSD + amountTotalUSDUntracked.toNumber();
  token1.feesUSD = token1.feesUSD + feesUSD.toNumber();
  token1.txCount = token1.txCount + ONE_BI;

  // updated pool ratess
  const prices = sqrtPriceX96ToTokenPrices(pool.sqrtPrice, token0, token1);

  pool.token0Price = prices[0];
  pool.token1Price = prices[1];

  // update USD pricing
  bundle.ethPriceUSD = ethPrice.toNumber();

  const [derivedETH0, derivedETH1] = await Promise.all([
    findEthPerToken(token0),
    findEthPerToken(token1),
  ]);
  token0.derivedETH = derivedETH0.toNumber();
  token1.derivedETH = derivedETH1.toNumber();

  /**
   * Things afffected by new USD rates
   */

  pool.totalValueLockedETH =
    pool.totalValueLockedToken0 * token0.derivedETH +
    pool.totalValueLockedToken1 * token1.derivedETH;
  pool.totalValueLockedUSD = pool.totalValueLockedETH * bundle.ethPriceUSD;

  factory.totalValueLockedETH =
    factory.totalValueLockedETH + pool.totalValueLockedETH;
  factory.totalValueLockedUSD =
    factory.totalValueLockedETH * bundle.ethPriceUSD;

  token0.totalValueLockedUSD =
    token0.totalValueLocked * token0.derivedETH * bundle.ethPriceUSD;
  token1.totalValueLockedUSD =
    token1.totalValueLocked * token1.derivedETH * bundle.ethPriceUSD;

  // create Swap event
  // const transaction = await loadTransaction(event)
  const swap = Swap.create({
    id: transaction.id + "#" + pool.txCount.toString(),
    transactionId: transaction.id,
    timestamp: transaction.timestamp,
    poolId: pool.id,
    token0Id: pool.token0Id,
    token1Id: pool.token1Id,
    sender: event.args.sender,
    origin: event.transaction.from,
    recipient: event.args.recipient,
    amount0: amount0.toNumber(),
    amount1: amount1.toNumber(),
    amountUSD: amountTotalUSDTracked.toNumber(),
    tick: BigInt(event.args.tick),
    sqrtPriceX96: event.args.sqrtPriceX96.toBigInt(),
    logIndex: BigInt(event.logIndex),
  });

  // update fee growth
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128.toBigInt();
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128.toBigInt();

  // interval data
  const [
    uniswapDayData,
    poolDayData,
    poolHourData,
    token0DayData,
    token1DayData,
    token0HourData,
    token1HourData,
  ] = await Promise.all([
    updateUniswapDayData(event),
    updatePoolDayData(event),
    updatePoolHourData(event),
    updateTokenDayData(token0, event),
    updateTokenDayData(token1, event),
    updateTokenHourData(token0, event),
    updateTokenHourData(token1, event),
  ]);

  // update volume metrics
  uniswapDayData.volumeETH =
    uniswapDayData.volumeETH + amountTotalETHTracked.toNumber();
  uniswapDayData.volumeUSD =
    uniswapDayData.volumeUSD + amountTotalUSDTracked.toNumber();
  uniswapDayData.feesUSD = uniswapDayData.feesUSD + feesUSD.toNumber();

  poolDayData.volumeUSD =
    poolDayData.volumeUSD + amountTotalUSDTracked.toNumber();
  poolDayData.volumeToken0 = poolDayData.volumeToken0 + amount0Abs.toNumber();
  poolDayData.volumeToken1 = poolDayData.volumeToken1 + amount1Abs.toNumber();
  poolDayData.feesUSD = poolDayData.feesUSD + feesUSD.toNumber();

  poolHourData.volumeUSD =
    poolHourData.volumeUSD + amountTotalUSDTracked.toNumber();
  poolHourData.volumeToken0 = poolHourData.volumeToken0 + amount0Abs.toNumber();
  poolHourData.volumeToken1 = poolHourData.volumeToken1 + amount1Abs.toNumber();
  poolHourData.feesUSD = poolHourData.feesUSD + feesUSD.toNumber();

  token0DayData.volume = token0DayData.volume + amount0Abs.toNumber();
  token0DayData.volumeUSD =
    token0DayData.volumeUSD + amountTotalUSDTracked.toNumber();
  token0DayData.untrackedVolumeUSD =
    token0DayData.untrackedVolumeUSD + amountTotalUSDTracked.toNumber();
  token0DayData.feesUSD = token0DayData.feesUSD + feesUSD.toNumber();

  token0HourData.volume = token0HourData.volume + amount0Abs.toNumber();
  token0HourData.volumeUSD =
    token0HourData.volumeUSD + amountTotalUSDTracked.toNumber();
  token0HourData.untrackedVolumeUSD =
    token0HourData.untrackedVolumeUSD + amountTotalUSDTracked.toNumber();
  token0HourData.feesUSD = token0HourData.feesUSD + feesUSD.toNumber();

  token1DayData.volume = token1DayData.volume + amount1Abs.toNumber();
  token1DayData.volumeUSD =
    token1DayData.volumeUSD + amountTotalUSDTracked.toNumber();
  token1DayData.untrackedVolumeUSD =
    token1DayData.untrackedVolumeUSD + amountTotalUSDTracked.toNumber();
  token1DayData.feesUSD = token1DayData.feesUSD + feesUSD.toNumber();

  token1HourData.volume = token1HourData.volume + amount1Abs.toNumber();
  token1HourData.volumeUSD =
    token1HourData.volumeUSD + amountTotalUSDTracked.toNumber();
  token1HourData.untrackedVolumeUSD =
    token1HourData.untrackedVolumeUSD + amountTotalUSDTracked.toNumber();
  token1HourData.feesUSD = token1HourData.feesUSD + feesUSD.toNumber();

  await Promise.all([
    bundle.save(),
    swap.save(),
    token0DayData.save(),
    token1DayData.save(),
    uniswapDayData.save(),
    poolDayData.save(),
    token0HourData.save(),
    token1HourData.save(),
    poolHourData.save(),
    factory.save(),
    pool.save(),
    token0.save(),
    token1.save(),
  ]);

  // Update inner vars of current or crossed ticks
  const newTick = BigNumber.from(pool.tick);
  const tickSpacing = feeTierToTickSpacing(BigNumber.from(pool.feeTier));
  const modulo = newTick.mod(tickSpacing);
  if (modulo.eq(ZERO_BI)) {
    // Current tick is initialized and needs to be updated
    await loadTickUpdateFeeVarsAndSave(newTick.toString(), event);
  }

  const numIters = BigNumber.from(oldTick).sub(newTick).abs().div(tickSpacing);
  assert(oldTick);

  if (numIters.gt(BigNumber.from(100))) {
    // In case more than 100 ticks need to be updated ignore the update in
    // order to avoid timeouts. From testing this behavior occurs only upon
    // pool initialization. This should not be a big issue as the ticks get
    // updated later. For early users this error also disappears when calling
    // collect
  } else if (newTick.gt(oldTick)) {
    const firstInitialized = BigNumber.from(oldTick).add(
      BigNumber.from(tickSpacing).add(modulo)
    );
    for (let i = firstInitialized; i.lte(newTick); i = i.add(tickSpacing)) {
      await loadTickUpdateFeeVarsAndSave(i.toString(), event);
    }
  } else if (newTick.lt(oldTick)) {
    const firstInitialized = BigNumber.from(oldTick).sub(modulo);
    for (let i = firstInitialized; i.gte(newTick); i = i.sub(tickSpacing)) {
      await loadTickUpdateFeeVarsAndSave(i.toString(), event);
    }
  }
}

export async function handleFlash(
  event: EthereumLog<FlashEvent["args"]>
): Promise<void> {
  // update fee growth
  const pool = await Pool.get(event.address);
  const poolContract = Pool__factory.connect(event.address, api);

  const [feeGrowthGlobal0X128, feeGrowthGlobal1X128] = await Promise.all([
    poolContract.feeGrowthGlobal0X128(),
    poolContract.feeGrowthGlobal1X128(),
  ]);
  assert(pool);
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128.toBigInt();
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128.toBigInt();
  await pool.save();
}

async function updateTickFeeVarsAndSave(
  tick: Tick,
  event: EthereumLog
): Promise<void> {
  const poolAddress = event.address;
  // not all ticks are initialized so obtaining null is expected behavior
  const poolContract = Pool__factory.connect(poolAddress, api);
  const tickResult = await poolContract.ticks(tick.tickIdx);
  tick.feeGrowthOutside0X128 = tickResult[2].toBigInt();
  tick.feeGrowthOutside1X128 = tickResult[3].toBigInt();
  await tick.save();

  await updateTickDayData(tick, event);
}

async function loadTickUpdateFeeVarsAndSave(
  tickId: string,
  event: EthereumLog
): Promise<void> {
  const poolAddress = event.address;
  const tick = await Tick.get(`${poolAddress}#${tickId.toString()}`);
  if (tick !== undefined) {
    await updateTickFeeVarsAndSave(tick, event);
  }
}
