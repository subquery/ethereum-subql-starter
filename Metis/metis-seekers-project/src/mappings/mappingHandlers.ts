import { Approval, Transfer, Address } from "../types";
import {
  ApproveTransaction,
  TransferLog,
} from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";

async function checkGetAddress(addressID: string): Promise<Address> {
  let address = await Address.get(addressID.toLowerCase());
  if (!address) {
    address = new Address(addressID.toLowerCase());
    await address.save();
  }
  return address;
}

export async function handleLog(log: TransferLog): Promise<void> {
  logger.info(`New transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const toAddress = await checkGetAddress(log.args.to);
  const fromAddress = await checkGetAddress(log.args.from);

  const transaction = Transfer.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    toId: toAddress.id,
    fromId: fromAddress.id,
    value: log.args.value.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleTransaction(tx: ApproveTransaction): Promise<void> {
  logger.info(`New Approval transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  const ownerAddress = await checkGetAddress(tx.from);
  const spenderAddress = await checkGetAddress(tx.args[0]);

  const approval = Approval.create({
    id: tx.hash,
    ownerId: ownerAddress.id,
    spenderId: spenderAddress.id,
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to,
  });

  await approval.save();
}
