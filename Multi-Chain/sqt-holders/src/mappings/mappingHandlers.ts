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
      created_block: BigInt(blockheight),
      created_date: new Date(Number(date) * 1000),
      current_balance: BigInt(0),
      last_balance_update: BigInt(blockheight),
      current_base_balance: BigInt(0),
      current_eth_balance: BigInt(0),
    });
    await account.save();
  }
  return account;
};

const calculateCurrentBalance = async (
  account: Account,
  changeValue: bigint,
  network: "BASE" | "ETHEREUM",
  blockheight: bigint
): Promise<Account> => {
  const fromTransactions = await Transfer.getByAccount_fromId(account.id);
  const toTransactions = await Transfer.getByAccount_toId(account.id);

  account.current_base_balance =
    BigInt(
      toTransactions!
        .filter((t) => t.network === "BASE")
        .map((t) => Number(t.value))
        .reduce((acc, val) => acc + val, 0) -
        fromTransactions!
          .filter((t) => t.network === "BASE")
          .map((t) => Number(t.value))
          .reduce((acc, val) => acc + val, 0)
    ) +
      network ===
    "BASE"
      ? changeValue
      : BigInt(0);

  account.current_eth_balance =
    BigInt(
      toTransactions!
        .filter((t) => t.network === "ETHEREUM")
        .map((t) => Number(t.value))
        .reduce((acc, val) => acc + val, 0) -
        fromTransactions!
          .filter((t) => t.network === "ETHEREUM")
          .map((t) => Number(t.value))
          .reduce((acc, val) => acc + val, 0)
    ) +
      network ===
    "ETHEREUM"
      ? changeValue
      : BigInt(0);

  account.current_balance =
    account.current_base_balance + account.current_eth_balance;

  account.last_balance_update = blockheight;

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
    account_fromId: fromAccount.id,
    account_toId: toAccount.id,
    block_height: BigInt(log.blockNumber),
    date: new Date(Number(log.block.timestamp) * 1000),
    raw_value: log.args.value.toBigInt(),
    value: log.args.value.toBigInt() / BigInt("1000000000000000000"),
  });

  await transaction.save();

  fromAccount = await calculateCurrentBalance(
    fromAccount,
    transaction.value * BigInt(-1),
    network,
    transaction.block_height
  );
  toAccount = await calculateCurrentBalance(
    fromAccount,
    transaction.value,
    network,
    transaction.block_height
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
