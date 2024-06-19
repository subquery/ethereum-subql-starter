import { Account, Transfer } from "../types";
import { TransferLog } from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";
import { Erc20Abi__factory } from "../types/contracts";

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
    });
    await account.save();
  }
  return account;
};

export async function handleTransfer(log: TransferLog): Promise<void> {
  logger.info(
    `New transfer transaction log at block ${log.blockNumber} with ${log.transactionHash}`
  );
  assert(log.args, "No log.args");

  const fromAccount = await checkGetAccount(
    log.args.from,
    log.blockNumber,
    log.block.timestamp
  );
  const toAccount = await checkGetAccount(
    log.args.to,
    log.blockNumber,
    log.block.timestamp
  );

  const transaction = Transfer.create({
    id: log.transactionHash,
    account_fromId: fromAccount.id,
    account_toId: toAccount.id,
    block_height: BigInt(log.blockNumber),
    date: new Date(Number(log.block.timestamp) * 1000),
    raw_value: log.args.value.toBigInt(),
    value: log.args.value.toBigInt() / BigInt("100000000000000000"),
  });

  const erc20 = Erc20Abi__factory.connect(process.env.SQT_CONTRACT!, api);

  // Update the account balances
  fromAccount.current_balance = (
    await erc20.balanceOf(fromAccount.id)
  ).toBigInt();
  fromAccount.last_balance_update = BigInt(log.blockNumber);
  toAccount.current_balance = (await erc20.balanceOf(toAccount.id)).toBigInt();
  toAccount.last_balance_update = BigInt(log.blockNumber);

  await Promise.all([
    transaction.save(),
    await fromAccount.save(),
    await toAccount.save(),
  ]);
}
