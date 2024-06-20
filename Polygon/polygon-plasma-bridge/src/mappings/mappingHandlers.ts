import assert from "assert";
import { Deposit, User, Withdrawl } from "../types";
import {
  TokenWithdrawnLog,
  TokenDepositedLog,
} from "../types/abi-interfaces/PlasmaAbi";

async function checkGetUser(user: string): Promise<User> {
  let userRecord = await User.get(user.toLowerCase());
  if (!userRecord) {
    userRecord = User.create({
      id: user.toLowerCase(),
      totalDeposits: BigInt(0),
      totalWithdrawls: BigInt(0),
    });
    await userRecord.save();
  }
  return userRecord;
}

export async function handleDeposit(deposit: TokenDepositedLog): Promise<void> {
  logger.info(`New deposit transaction log at block ${deposit.blockNumber}`);
  assert(deposit.args, "No args on deposit");
  const userId = deposit.args[2].toLowerCase();

  const userRecord = await checkGetUser(userId);

  const depositRecord = Deposit.create({
    id: deposit.args[4].toString(),
    rootToken: deposit.args[0],
    childToken: deposit.args[1],
    userId,
    amount: deposit.args[3].toBigInt(),
    amountFriendly: deposit.args[3].toBigInt(),
  });
  await depositRecord.save();

  userRecord.totalDeposits += depositRecord.amount;
  await userRecord.save();
}

export async function handleWithdrawl(
  withdrawl: TokenWithdrawnLog,
): Promise<void> {
  logger.info(
    `New Withdrawl transaction log at block ${withdrawl.blockNumber}`,
  );
  assert(withdrawl.args, "Need withdrawl args");
  const userId = withdrawl.args[2].toLowerCase();

  const userRecord = await checkGetUser(userId);

  const withdrawlRecord = Withdrawl.create({
    id: withdrawl.args[4].toString(),
    rootToken: withdrawl.args[0],
    childToken: withdrawl.args[1],
    userId,
    amount: withdrawl.args[3].toBigInt(),
    amountFriendly: withdrawl.args[3].toBigInt(),
  });
  await withdrawlRecord.save();

  userRecord.totalWithdrawls += withdrawlRecord.amount;
  await userRecord.save();
}
