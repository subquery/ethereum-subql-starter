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
  // 1.0001^tick is token1/token0.
  // return bigNumber.js bignumber and convert to number
  const price0 = Math.pow(1.0001, tickIdx);

  const tick = Tick.create({
    id: tickId,
    tickIdx: BigInt(tickIdx),
    poolId: poolId,
    poolAddress: poolId,

    createdAtTimestamp: event.block.timestamp,
    createdAtBlockNumber: BigInt(event.block.number),
    liquidityGross: ZERO_BI,
    liquidityNet: ZERO_BI,
    liquidityProviderCount: ZERO_BI,

    price0: ONE_BD.toNumber(),
    price1: safeDivNumToNum(1, price0),
    volumeToken0: ZERO_BD.toNumber(),
    volumeToken1: ZERO_BD.toNumber(),
    volumeUSD: ZERO_BD.toNumber(),
    feesUSD: ZERO_BD.toNumber(),
    untrackedVolumeUSD: ZERO_BD.toNumber(),
    collectedFeesToken0: ZERO_BD.toNumber(),
    collectedFeesToken1: ZERO_BD.toNumber(),
    collectedFeesUSD: ZERO_BD.toNumber(),
    feeGrowthOutside0X128: ZERO_BI,
    feeGrowthOutside1X128: ZERO_BI,
  });

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
