// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  WHITELIST_TOKENS,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenTotalSupply,
  fetchTokenDecimals,
  ADDRESS_ZERO,
  FACTORY_ADDRESS,
  ONE_BI,
  ZERO_BI,
} from "./utils";
import {
  Pool,
  Token,
  Bundle,
  Factory,
  createPoolDatasource,
  WhiteListPools,
} from "../types";
import { EthereumLog } from "@subql/types-ethereum";
import { PoolCreatedEvent } from "../types/contracts/Factory";
import assert from "assert";

export async function handlePoolCreated(
  event: EthereumLog<PoolCreatedEvent["args"]>
): Promise<void> {
  // temp fix
  if (event.address === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248") {
    return;
  }
  assert(event.args);

  await createPoolDatasource({
    address: event.args.pool,
  });

  // load factory
  let factory = await Factory.get(FACTORY_ADDRESS);
  if (factory === undefined || factory === undefined) {
    factory = Factory.create({
      id: FACTORY_ADDRESS,
      poolCount: ZERO_BI,
      totalVolumeETH: 0,
      totalVolumeUSD: 0,
      untrackedVolumeUSD: 0,
      totalFeesUSD: 0,
      totalFeesETH: 0,
      totalValueLockedETH: 0,
      totalValueLockedUSD: 0,
      totalValueLockedUSDUntracked: 0,
      totalValueLockedETHUntracked: 0,
      txCount: ZERO_BI,
      owner: ADDRESS_ZERO,
    });
    // create new bundle for tracking eth price
    const bundle = Bundle.create({
      id: "1",
      ethPriceUSD: 0,
    });

    await bundle.save();
  }

  let [token0, token1] = await Promise.all([
    Token.get(event.args.token0),
    Token.get(event.args.token1),
  ]);
  // fetch info if nul
  if (token0 === undefined || token0 == null) {
    const [symbol, name, totalSupply, decimals] = await Promise.all([
      fetchTokenSymbol(event.args.token0),
      fetchTokenName(event.args.token0),
      fetchTokenTotalSupply(event.args.token0).then((r) => r.toBigInt()),
      fetchTokenDecimals(event.args.token0),
    ]);
    // bail if we couldn't figure out the decimals
    if (!decimals) {
      return;
    }

    token0 = Token.create({
      id: event.args.token0,
      symbol,
      name,
      totalSupply,
      decimals: decimals.toBigInt(),
      derivedETH: 0,
      volume: 0,
      volumeUSD: 0,
      feesUSD: 0,
      untrackedVolumeUSD: 0,
      totalValueLocked: 0,
      totalValueLockedUSD: 0,
      totalValueLockedUSDUntracked: 0,
      txCount: ZERO_BI,
      poolCount: ZERO_BI,
    });
  }

  if (token1 === undefined || token1 == null) {
    const [symbol, name, totalSupply, decimals] = await Promise.all([
      fetchTokenSymbol(event.args.token1),
      fetchTokenName(event.args.token1),
      fetchTokenTotalSupply(event.args.token1).then((r) => r.toBigInt()),
      fetchTokenDecimals(event.args.token1),
    ]);
    // bail if we couldn't figure out the decimals
    if (!decimals) {
      return;
    }

    token1 = Token.create({
      id: event.args.token1,
      symbol,
      name,
      totalSupply,
      decimals: decimals.toBigInt(),
      derivedETH: 0,
      volume: 0,
      volumeUSD: 0,
      feesUSD: 0,
      untrackedVolumeUSD: 0,
      totalValueLocked: 0,
      totalValueLockedUSD: 0,
      totalValueLockedUSDUntracked: 0,
      txCount: ZERO_BI,
      poolCount: ZERO_BI,
    });
  }

  factory.poolCount = factory.poolCount + ONE_BI;

  const pool = Pool.create({
    id: event.args.pool,
    token0Id: token0.id,
    token1Id: token1.id,
    feeTier: BigInt(event.args.fee),
    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: BigInt(event.blockNumber),
    liquidityProviderCount: ZERO_BI,
    txCount: ZERO_BI,
    liquidity: ZERO_BI,
    sqrtPrice: ZERO_BI,
    feeGrowthGlobal0X128: ZERO_BI,
    feeGrowthGlobal1X128: ZERO_BI,
    token0Price: 0,
    token1Price: 0,
    observationIndex: ZERO_BI,
    totalValueLockedToken0: 0,
    totalValueLockedToken1: 0,
    totalValueLockedUSD: 0,
    totalValueLockedETH: 0,
    totalValueLockedUSDUntracked: 0,
    volumeToken0: 0,
    volumeToken1: 0,
    volumeUSD: 0,
    feesUSD: 0,
    untrackedVolumeUSD: 0,
    collectedFeesToken0: 0,
    collectedFeesToken1: 0,
    collectedFeesUSD: 0,
  });

  // update white listed pools
  if (WHITELIST_TOKENS.includes(token0.id)) {
    const newPool = WhiteListPools.create({
      id: `${pool.id + token1.id}`,
      tokenId: token1.id,
      poolId: pool.id,
    });
    await newPool.save();
  }
  if (WHITELIST_TOKENS.includes(token1.id)) {
    const newPool = WhiteListPools.create({
      id: `${pool.id + token0.id}`,
      tokenId: token0.id,
      poolId: pool.id,
    });
    await newPool.save();
  }

  await Promise.all([
    token0.save(),
    token1.save(), // create the tracked contract based on the template
    pool.save(),
    factory.save(),
  ]);
}
