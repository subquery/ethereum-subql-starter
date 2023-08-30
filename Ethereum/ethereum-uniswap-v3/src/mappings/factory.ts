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
  ZERO_BD,
  ZERO_BI,
} from "./utils";
import { BigNumber } from "@ethersproject/bignumber";
// import {BigNumber} from "ethers"
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

export async function handlePoolCreated(
  event: EthereumLog<PoolCreatedEvent["args"]>
): Promise<void> {
  // temp fix
  if (event.address === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248") {
    return;
  }

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

  factory.poolCount = factory.poolCount + ONE_BI;

  // let pool = new Pool(event.args.pool.toHexString()) as Pool
  const pool = new Pool(event.args.pool);

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

  pool.token0Id = token0.id;
  pool.token1Id = token1.id;
  pool.feeTier = BigInt(event.args.fee);
  pool.createdAtTimestamp = event.block.timestamp;
  pool.createdAtBlockNumber = BigInt(event.blockNumber);
  pool.liquidityProviderCount = ZERO_BI;
  pool.txCount = ZERO_BI;
  pool.liquidity = ZERO_BI;
  pool.sqrtPrice = ZERO_BI;
  pool.feeGrowthGlobal0X128 = ZERO_BI;
  pool.feeGrowthGlobal1X128 = ZERO_BI;
  pool.token0Price = 0;
  pool.token1Price = 0;
  pool.observationIndex = ZERO_BI;
  pool.totalValueLockedToken0 = 0;
  pool.totalValueLockedToken1 = 0;
  pool.totalValueLockedUSD = 0;
  pool.totalValueLockedETH = 0;
  pool.totalValueLockedUSDUntracked = 0;
  pool.volumeToken0 = 0;
  pool.volumeToken1 = 0;
  pool.volumeUSD = 0;
  pool.feesUSD = 0;
  pool.untrackedVolumeUSD = 0;
  pool.collectedFeesToken0 = 0;
  pool.collectedFeesToken1 = 0;
  pool.collectedFeesUSD = 0;

  await Promise.all([
    token0.save(),
    token1.save(), // create the tracked contract based on the template
    pool.save(),
    factory.save(),
  ]);
}
