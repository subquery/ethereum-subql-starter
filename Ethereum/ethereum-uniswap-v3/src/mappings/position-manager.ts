// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Position, PositionSnapshot, Token } from "../types";
import { NonfungiblePositionManager__factory } from "../types/contracts";
import {
  IncreaseLiquidityEvent,
  DecreaseLiquidityEvent,
  CollectEvent,
  TransferEvent,
} from "../types/contracts/NonfungiblePositionManager";
import {
  ADDRESS_ZERO,
  factoryContract,
  ZERO_BD,
  ZERO_BI,
  convertTokenToDecimal,
  loadTransaction,
} from "./utils";
import { EthereumLog } from "@subql/types-ethereum";
import { BigNumber } from "ethers";
import assert = require("assert");

async function getPosition(
  event: EthereumLog,
  tokenId: BigNumber,
): Promise<Position | null> {
  let position = await Position.get(tokenId.toString());

  if (position === undefined) {
    const contract = NonfungiblePositionManager__factory.connect(
      event.address,
      api,
    );
    let positionResult;
    try {
      positionResult = await contract.positions(tokenId);
    } catch (e) {
      logger.warn(
        `Contract ${event.address}, could not get position with tokenId ${tokenId}`,
      );
      return null;
    }

    const [poolAddress, transaction] = await Promise.all([
      factoryContract.getPool(
        positionResult[2],
        positionResult[3],
        positionResult[4],
      ),
      loadTransaction(event),
    ]);
    // the following call reverts in situations where the position is minted
    // and deleted in the same block - from my investigation this happens
    // in calls from  BancorSwap
    // (e.g. 0xf7867fa19aa65298fadb8d4f72d0daed5e836f3ba01f0b9b9631cdc6c36bed40)

    // The owner gets correctly updated in the Transfer handler
    position = Position.create({
      id: tokenId.toString(),
      owner: ADDRESS_ZERO,
      poolId: poolAddress,
      token0Id: positionResult[2],
      token1Id: positionResult[3],
      tickLowerId: `${poolAddress}#${positionResult[5].toString()}`,
      tickUpperId: `${poolAddress}#${positionResult[6].toString()}`,
      liquidity: ZERO_BI,
      depositedToken0: 0, //ZERO_BD.toNumber(),
      depositedToken1: 0, //ZERO_BD.toNumber(),
      withdrawnToken0: 0, //ZERO_BD.toNumber(),
      withdrawnToken1: 0, //ZERO_BD.toNumber(),
      collectedFeesToken0: 0, //ZERO_BD.toNumber(),
      collectedFeesToken1: 0, //ZERO_BD.toNumber(),
      transactionId: transaction.id,
      feeGrowthInside0LastX128: positionResult[8].toBigInt(),
      feeGrowthInside1LastX128: positionResult[9].toBigInt(),
    });
  }
  return position;
}

async function updateFeeVars(
  position: Position,
  event: EthereumLog,
  tokenId: BigNumber,
): Promise<Position> {
  const positionManagerContract = NonfungiblePositionManager__factory.connect(
    event.address,
    api,
  );
  const positionResult = await positionManagerContract.positions(tokenId);
  position.feeGrowthInside0LastX128 = positionResult[8].toBigInt();
  position.feeGrowthInside1LastX128 = positionResult[9].toBigInt();
  return position;
}

async function savePositionSnapshot(
  position: Position,
  event: EthereumLog,
): Promise<void> {
  const positionSnapshot = PositionSnapshot.create({
    id: `${position.id}#${event.blockNumber.toString()}`,
    owner: position.owner,
    poolId: position.poolId,
    positionId: position.id,
    blockNumber: BigInt(event.blockNumber),
    timestamp: event.block.timestamp,
    liquidity: position.liquidity,
    depositedToken0: position.depositedToken0,
    depositedToken1: position.depositedToken1,
    withdrawnToken0: position.withdrawnToken0,
    withdrawnToken1: position.withdrawnToken1,
    collectedFeesToken0: position.collectedFeesToken0,
    collectedFeesToken1: position.collectedFeesToken1,
    transactionId: (await loadTransaction(event)).id,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
  });
  await positionSnapshot.save();
}

export async function handleIncreaseLiquidity(
  event: EthereumLog<IncreaseLiquidityEvent["args"]>,
): Promise<void> {
  // temp fix
  if (BigNumber.from(event.blockNumber).eq(14317993)) {
    return;
  }

  assert(event.args);
  const position = await getPosition(event, event.args.tokenId);

  // position was not able to be fetched
  if (position == undefined || position === null) {
    return;
  }

  // temp fix
  if (position.poolId === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248") {
    return;
  }
  assert(event.args);

  const [token0, token1] = await Promise.all([
    Token.get(position.token0Id),
    Token.get(position.token1Id),
  ]);
  assert(token0);
  assert(token1);

  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  const amount1 = convertTokenToDecimal(event.args.amount1, token1.decimals);

  position.liquidity = BigNumber.from(position.liquidity)
    .add(event.args.liquidity)
    .toBigInt();

  position.depositedToken0 = BigNumber.from(position.depositedToken0)
    .add(amount0)
    .toNumber();
  position.depositedToken1 = BigNumber.from(position.depositedToken1)
    .add(amount1)
    .toNumber();

  await updateFeeVars(position, event, event.args.tokenId);

  await position.save();

  await savePositionSnapshot(position, event);
}

export async function handleDecreaseLiquidity(
  event: EthereumLog<DecreaseLiquidityEvent["args"]>,
): Promise<void> {
  // temp fix
  if (event.blockNumber == 14317993) {
    return;
  }
  assert(event.args);

  let position = await getPosition(event, event.args.tokenId);

  // position was not able to be fetched
  if (position === undefined || position === null) {
    return;
  }

  // temp fix
  if (position.poolId === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248") {
    return;
  }

  const [token0, token1] = await Promise.all([
    Token.get(position.token0Id),
    Token.get(position.token1Id),
  ]);
  assert(token0);
  assert(token1);

  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  const amount1 = convertTokenToDecimal(event.args.amount1, token1.decimals);

  position.liquidity = position.liquidity - event.args.liquidity.toBigInt();
  position.withdrawnToken0 = amount0.add(position.withdrawnToken0).toNumber();
  position.withdrawnToken1 = amount1.add(position.withdrawnToken1).toNumber();

  position = await updateFeeVars(position, event, event.args.tokenId);
  await position.save();
  await savePositionSnapshot(position, event);
}

export async function handleCollect(
  event: EthereumLog<CollectEvent["args"]>,
): Promise<void> {
  assert(event.args);
  let position = await getPosition(event, event.args.tokenId);
  // position was not able to be fetched
  if (position === undefined || position === null) {
    return;
  }
  if (position.poolId === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248") {
    return;
  }

  const token0 = await Token.get(position.token0Id);
  assert(token0);
  const amount0 = convertTokenToDecimal(event.args.amount0, token0.decimals);
  position.collectedFeesToken0 = amount0
    .add(position.collectedFeesToken0)
    .toNumber();
  position.collectedFeesToken1 = amount0
    .add(position.collectedFeesToken1)
    .toNumber();

  position = await updateFeeVars(position, event, event.args.tokenId);

  await Promise.all([position.save(), savePositionSnapshot(position, event)]);
}

export async function handleTransfer(
  event: EthereumLog<TransferEvent["args"]>,
): Promise<void> {
  assert(event.args);
  const position = await getPosition(event, event.args.tokenId);

  // position was not able to be fetched
  if (position === undefined || position === null) {
    return;
  }

  position.owner = event.args.to;
  await Promise.all([position.save(), savePositionSnapshot(position, event)]);
}
