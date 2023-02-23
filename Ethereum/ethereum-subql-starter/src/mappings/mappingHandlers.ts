// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { EthereumTransaction, EthereumLog } from "@subql/types-ethereum";
import { BigNumber } from "@ethersproject/bignumber";

import { Approval, Transaction } from "../types";

// Setup types from ABI
type TransferEventArgs = [string, string, BigNumber] & {
  from: string;
  to: string;
  value: BigNumber;
};
type ApproveCallArgs = [string, BigNumber] & {
  _spender: string;
  _value: BigNumber;
};

export async function handleLog(
  log: EthereumLog<TransferEventArgs>
): Promise<void> {
  const transaction = Transaction.create({
    id: log.transactionHash,
    value: log.args.value.toBigInt(),
    from: log.args.from,
    to: log.args.to,
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleTransaction(
  tx: EthereumTransaction<ApproveCallArgs>
): Promise<void> {
  const approval = Approval.create({
    id: tx.hash,
    owner: tx.from,
    value: tx.args._value.toBigInt(),
    spender: tx.args._spender,
    contractAddress: tx.to,
  });

  await approval.save();
}
