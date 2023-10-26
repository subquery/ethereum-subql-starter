import assert from "assert";
import {
  DepositOnEthereum,
  User,
  DepositOnPolygon,
  BridgeTransaction,
} from "../types";
import { TokenDepositedLog } from "../types/abi-interfaces/PlasmaAbi";
import { NewDepositBlockLog } from "../types/abi-interfaces/PlasmaEthAbi";

async function checkGetUser(user: string): Promise<User> {
  let userRecord = await User.get(user.toLowerCase());
  if (!userRecord) {
    userRecord = User.create({
      id: user.toLowerCase(),
      totalDeposits: BigInt(0),
    });
    await userRecord.save();
  }
  return userRecord;
}

export async function handlePolygonDeposit(
  deposit: TokenDepositedLog
): Promise<void> {
  assert(deposit.args, "No args on deposit");
  const userId = deposit.args[2].toLowerCase();
  const userRecord = await checkGetUser(userId);

  const depositRecord = DepositOnPolygon.create({
    id: deposit.args[4].toString(),
    rootToken: deposit.args[0],
    childToken: deposit.args[1],
    userId: userId,
    amount: deposit.args[3].toBigInt(),
    tx: deposit.transactionHash,
  });
  await depositRecord.save();

  userRecord.totalDeposits += depositRecord.amount;
  await userRecord.save();

  let bridgeTransactionRecord = await BridgeTransaction.get(
    deposit.args.depositCount.toString()
  );
  if (!bridgeTransactionRecord) {
    bridgeTransactionRecord = BridgeTransaction.create({
      id: deposit.args.depositCount.toString(),
    });
  }
  bridgeTransactionRecord.depositOnPolygonId =
    deposit.args.depositCount.toString();
  await bridgeTransactionRecord.save();
}

export async function handleEthereumDepositBlock(
  deposit: NewDepositBlockLog
): Promise<void> {
  assert(deposit.args, "No args on deposit");
  const userId = deposit.args.owner.toLocaleLowerCase();
  const userRecord = await checkGetUser(userId);

  const depositRecord = DepositOnEthereum.create({
    id: deposit.args.depositBlockId.toString(),
    token: deposit.args.token,
    userId: userId,
    amount: deposit.args.amountOrNFTId.toBigInt(),
    tx: deposit.transactionHash,
  });
  await depositRecord.save();

  userRecord.totalDeposits += depositRecord.amount;
  await userRecord.save();

  let bridgeTransactionRecord = await BridgeTransaction.get(
    deposit.args.depositBlockId.toString()
  );
  if (!bridgeTransactionRecord) {
    bridgeTransactionRecord = BridgeTransaction.create({
      id: deposit.args.depositBlockId.toString(),
    });
  }
  bridgeTransactionRecord.depositOnEthereumId =
    deposit.args.depositBlockId.toString();
  await bridgeTransactionRecord.save();
}
