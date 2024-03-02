// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from "../../types";
import { ZERO_BD } from "./constants";
import { BigNumber } from "@ethersproject/bignumber";
import { EthereumLog } from "@subql/types-ethereum";
import assert from "assert";

export function exponentToBigDecimal(decimals: bigint): BigNumber {
  if (Number(decimals) === 0) {
    return BigNumber.from("1");
  }
  const base = BigInt(10);
  const pwr = base ** decimals;
  return BigNumber.from(pwr);
}

export function safeDivNumToNum(amount0: number, amount1: number): number {
  return amount1 === 0 ? 0 : amount0 / amount1;
}

export function safeDiv(amount0: BigNumber, amount1: BigNumber): BigNumber {
  // I assume eq means equal
  if (amount1.eq(ZERO_BD)) {
    // return BigNumber.from(ZERO_BD)
    return ZERO_BD;
  } else {
    return amount0.div(amount1);
  }
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

export function convertTokenToDecimal(
  tokenAmount: BigNumber,
  exchangeDecimals: bigint
): BigNumber {
  if (Number(exchangeDecimals) == 0) {
    return tokenAmount;
  }
  return tokenAmount.div(exponentToBigDecimal(exchangeDecimals));
}

export async function loadTransaction(
  event: EthereumLog
): Promise<Transaction> {
  let transaction = await Transaction.get(event.transactionHash);
  if (transaction === undefined) {
    transaction = Transaction.create({
      id: event.transactionHash,
      blockNumber: BigInt(event.blockNumber),
      timestamp: event.block.timestamp,
      gasPrice: BigInt(0),
      gasUsed: BigInt(0),
    });
  }

  // transaction.gasPrice = event.block.gasPrice
  const eventTransaction = event.block.transactions.find(
    (transaction) =>
      transaction.transactionIndex ==
      BigNumber.from(event.transactionIndex).toBigInt()
  );
  assert(eventTransaction);
  // transaction.gasUsed = (await eventTransaction.receipt()).gasUsed;
  transaction.gasPrice = eventTransaction.gasPrice;
  await transaction.save();
  return transaction;
}
