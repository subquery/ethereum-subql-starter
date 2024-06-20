import { Account, Transfer } from "../types";
import { TransferLog } from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";
import { EthereumBlock } from "@subql/types-ethereum";

const checkGetAccount = async (
  address: string,
  blockheight: number,
  date: bigint
): Promise<Account> => {
  let account = await Account.get(address.toLowerCase());
  if (!account) {
    // create one
    account = Account.create({
      id: address.toLowerCase(),
      createdBlock: BigInt(blockheight),
      createdDate: new Date(Number(date) * 1000),
      currentBalance: 0,
      lastBalanceUpdate: BigInt(blockheight),
      currentBaseBalance: 0,
      currentEthBalance: 0,
    });
    await account.save();
  }
  return account;
};

const calculateCurrentBalance = async (
  account: Account,
  network: "BASE" | "ETHEREUM",
  blockheight: bigint
): Promise<Account> => {
  const fromTransactions =
    (await Transfer.getByAccountFromId(account.id)) || [];
  const toTransactions = (await Transfer.getByAccountToId(account.id)) || [];

  logger.info(
    `There are ${(
      fromTransactions.length + toTransactions.length
    ).toString()} transactions relating to ${account.id}`
  );

  account.currentEthBalance =
    toTransactions
      .filter((t) => t.network === "ETHEREUM")
      .reduce((acc, val) => acc + val.value, 0) -
    fromTransactions
      .filter((t) => t.network === "ETHEREUM")
      .reduce((acc, val) => acc + val.value, 0);

  account.currentBaseBalance =
    toTransactions
      .filter((t) => t.network === "BASE")
      .reduce((acc, val) => acc + val.value, 0) -
    fromTransactions
      .filter((t) => t.network === "BASE")
      .reduce((acc, val) => acc + val.value, 0);

  account.currentBalance =
    account.currentBaseBalance + account.currentEthBalance;

  account.lastBalanceUpdate = blockheight;

  return account;
};

const handleTransfer = async (
  log: TransferLog,
  network: "BASE" | "ETHEREUM"
): Promise<void> => {
  logger.info(
    `New transfer transaction log at block ${log.blockNumber} with ${log.transactionHash}`
  );
  assert(log.args, "No log.args");

  let fromAccount = await checkGetAccount(
    log.args.from,
    log.blockNumber,
    log.block.timestamp
  );
  let toAccount = await checkGetAccount(
    log.args.to,
    log.blockNumber,
    log.block.timestamp
  );

  const transaction = Transfer.create({
    id: log.transactionHash,
    network,
    accountFromId: fromAccount.id,
    accountToId: toAccount.id,
    blockHeight: BigInt(log.blockNumber),
    date: new Date(Number(log.block.timestamp) * 1000),
    rawValue: log.args.value.toBigInt(),
    value: Number(log.args.value.toBigInt() / BigInt("1000000000000000000")),
  });

  await transaction.save();

  fromAccount = await calculateCurrentBalance(
    fromAccount,
    network,
    transaction.blockHeight
  );
  toAccount = await calculateCurrentBalance(
    toAccount,
    network,
    transaction.blockHeight
  );

  await Promise.all([fromAccount.save(), toAccount.save()]);
};

export async function updateBalances(block: EthereumBlock): Promise<void> {
  // Later
}

export async function handleBaseTransfer(log: TransferLog): Promise<void> {
  return handleTransfer(log, "BASE");
}

export async function handleEtherumTransfer(log: TransferLog): Promise<void> {
  return handleTransfer(log, "ETHEREUM");
}
