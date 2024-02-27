import { Approval, Transfer, Address } from "../types";
import {
  ApproveTransaction,
  TransferLog,
} from "../types/abi-interfaces/Erc20Abi";
import assert from "assert";
import { Erc20Abi__factory } from "../types/contracts";
import { contractAddress } from "../const";

// Creating an instance of the ERC20 contract using its factory and contract address
const erc20 = Erc20Abi__factory.connect(contractAddress, api);

async function getOrCreateAddress(accountAddress: string): Promise<Address> {
  // Check if the Address instance already exists in the database
  let address = await Address.get(accountAddress);

  // If the Address doesn't exist, create a new one with id and balance
  if (address == undefined) {
    address = Address.create({
      id: accountAddress,
      balance: (await erc20.balanceOf(accountAddress)).toBigInt(),
    });
  }

  // Save the Address instance in the database and return it
  address.save();
  return address;
}

export async function handleLog(log: TransferLog): Promise<void> {
  logger.info(`New transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  // Retrieving or creating Address instances for 'from' and 'to' addresses
  const [from, to, fromBalance, toBalance] = await Promise.all([
    getOrCreateAddress(log.args.from),
    getOrCreateAddress(log.args.to),
    (await erc20.balanceOf(log.args.from)).toBigInt(),
    (await erc20.balanceOf(log.args.to)).toBigInt(),
  ]);

  let value = log.args.value.toBigInt();

  // Performing several asynchronous operations in parallel using Promise.all
  await Promise.all([
    // Creating a new Transfer instance and saving it to the database
    (async () => {
      const transfer = Transfer.create({
        id: log.transactionHash + "-" + log.logIndex,
        blockHeight: BigInt(log.blockNumber),
        toId: to.id,
        fromId: from.id,
        value: value,
        contractAddress: log.address,
      });
      await transfer.save();
    })(),
    // Updating the balance of the 'from' Address instance and saving it
    (async () => {
      from.balance = fromBalance;
      await from.save();
    })(),
    // Updating the balance of the 'to' Address instance and saving it
    (async () => {
      to.balance = toBalance;
      await to.save();
    })(),
  ]);
}

export async function handleTransaction(tx: ApproveTransaction): Promise<void> {
  logger.info(`New Approval transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  // Creating a new Approval instance and saving it to the database
  const approval = Approval.create({
    id: tx.hash,
    ownerId: (await getOrCreateAddress(tx.from)).id,
    spenderId: (await getOrCreateAddress(tx.args[0])).id,
    value: BigInt(await tx.args[1].toString()),
    contractAddress: tx.to,
  });

  await approval.save();
}
