// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { safeDivNumToNum } from "./utils";
import { Tick } from "../../types";
import { ONE_BD, ZERO_BD, ZERO_BI } from "./constants";
import { EthereumLog } from "@subql/types-ethereum";
import { BigNumber } from "@ethersproject/bignumber";
import { MintEvent } from "../../types/contracts/Pool";

export function createTick(
  tickId: string,
  tickIdx: number,
  poolId: string,
  event: EthereumLog<MintEvent["args"]>
): Tick {
  const tick = new Tick(tickId);
  tick.tickIdx = BigInt(tickIdx);
  tick.poolId = poolId;
  tick.poolAddress = poolId;

  tick.createdAtTimestamp = event.block.timestamp;
  tick.createdAtBlockNumber = BigInt(event.block.number);
  tick.liquidityGross = ZERO_BI;
  tick.liquidityNet = ZERO_BI;
  tick.liquidityProviderCount = ZERO_BI;

  tick.price0 = ONE_BD.toNumber();
  tick.price1 = ONE_BD.toNumber();

  // 1.0001^tick is token1/token0.
  // return bigNumber.js bignumber and convert to number
  const price0 = Math.pow(1.0001, tickIdx);
  tick.price0 = price0;
  tick.price1 = safeDivNumToNum(1, tick.price0);
  tick.volumeToken0 = ZERO_BD.toNumber();
  tick.volumeToken1 = ZERO_BD.toNumber();
  tick.volumeUSD = ZERO_BD.toNumber();
  tick.feesUSD = ZERO_BD.toNumber();
  tick.untrackedVolumeUSD = ZERO_BD.toNumber();
  tick.collectedFeesToken0 = ZERO_BD.toNumber();
  tick.collectedFeesToken1 = ZERO_BD.toNumber();
  tick.collectedFeesUSD = ZERO_BD.toNumber();
  tick.liquidityProviderCount = ZERO_BI;
  tick.feeGrowthOutside0X128 = ZERO_BI;
  tick.feeGrowthOutside1X128 = ZERO_BI;
  return tick;
}

export function feeTierToTickSpacing(feeTier: BigNumber): BigNumber {
  if (feeTier.eq(BigNumber.from(10000))) {
    return BigNumber.from(200);
  }
  if (feeTier.eq(BigNumber.from(3000))) {
    return BigNumber.from(60);
  }
  if (feeTier.eq(BigNumber.from(500))) {
    return BigNumber.from(10);
  }
  if (feeTier.eq(BigNumber.from(100))) {
    return BigNumber.from(1);
  }

  throw Error("Unexpected fee tier");
}
