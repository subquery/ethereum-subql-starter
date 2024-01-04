import { Approval, Transfer, Address } from "../types";
import {
  ApproveTransaction,
  TransferLog,
} from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";
import { Erc20Abi__factory } from "../types/contracts";

const erc20 = Erc20Abi__factory.connect(
  // This argument needs to match precisely with the one found in `dataSources`.`options`.`address` within `project.ts`.
  "0xe47d957F83F8887063150AaF7187411351643392",
  api
);

async function getOrCreateAddress(accountAddress: string): Promise<Address> {
  let address = await Address.get(accountAddress);

  if (address == undefined) {
    address = Address.create({
      id: accountAddress,
      balance: (await erc20.balanceOf(accountAddress)).toBigInt(),
    });
  }

  address.save();
  return address;
}

export async function handleLog(log: TransferLog): Promise<void> {
  logger.info(`New transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  let from = await getOrCreateAddress(log.args.from);
  let to = await getOrCreateAddress(log.args.to);
  let value = log.args.value.toBigInt();

  const transfer = Transfer.create({
    id: log.transactionHash + "-" + log.logIndex,
    blockHeight: BigInt(log.blockNumber),
    toId: to.id,
    fromId: from.id,
    value: value,
    contractAddress: log.address,
  });

  from.balance = BigInt(from.balance) - value;
  to.balance = BigInt(to.balance) + value;

  await transfer.save();
  await from.save();
  await to.save();
}

export async function handleTransaction(tx: ApproveTransaction): Promise<void> {
  logger.info(`New Approval transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  const approval = Approval.create({
    id: tx.hash,
    ownerId: (await getOrCreateAddress(tx.from)).id,
    spenderId: (await getOrCreateAddress(tx.args[0])).id,
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to,
  });

  await approval.save();
}
