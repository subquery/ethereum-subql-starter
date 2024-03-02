import assert from "assert";
import { Pool, PoolEvent } from "../types";
import { DepositLog, WithdrawLog } from "../types/abi-interfaces/MoboxAbi";

async function checkGetPool(id: string): Promise<Pool> {
  // Try get an existing Pool record first by ID
  let poolRecord = await Pool.get(id);
  if (!poolRecord) {
    // Pool record does not exist, create one
    poolRecord = Pool.create({
      id: id,
      totalSize: BigInt(0),
    });
    await poolRecord.save();
  }
  return poolRecord;
}

export async function handleDeposit(deposit: DepositLog): Promise<void> {
  logger.info(`New deposit transaction log at block ${deposit.blockNumber}`);
  assert(deposit.args, "Require args");
  const poolId = deposit.args[1].toString();

  // Check and get the pool record from the store
  const poolRecord = await checkGetPool(poolId);

  const poolEventRecord = PoolEvent.create({
    id: `${deposit.transactionHash}-${deposit.logIndex}`,
    user: deposit.args[0],
    poolId,
    type: "DEPOSIT",
    value: deposit.args[2].toBigInt(),
    block: BigInt(deposit.blockNumber),
    timestamp: deposit.block.timestamp,
  });
  await poolEventRecord.save();

  // Increase the total pool size by the new deposit value
  poolRecord.totalSize += poolEventRecord.value;
  await poolRecord.save();
}

export async function handleWithdraw(withdraw: WithdrawLog): Promise<void> {
  logger.info(`New withdraw transaction log at block ${withdraw.blockNumber}`);
  assert(withdraw.args, "Require args");
  const poolId = withdraw.args[1].toString();

  // Check and get the pool record from the store
  const poolRecord = await checkGetPool(poolId);

  const poolEventRecord = PoolEvent.create({
    id: `${withdraw.transactionHash}-${withdraw.logIndex}`,
    user: withdraw.args[0],
    poolId,
    type: "WITHDRAW",
    value: withdraw.args[2].toBigInt(),
    block: BigInt(withdraw.blockNumber),
    timestamp: withdraw.block.timestamp,
  });
  await poolEventRecord.save();

  // Decrease the total pool size by the new withdrawl value
  poolRecord.totalSize -= poolEventRecord.value;
  await poolRecord.save();
}
