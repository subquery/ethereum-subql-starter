import { EthereumTransaction } from "@subql/types-ethereum";
import { NativeTokenTransaction, Transfer, Address } from "../types";
import { TransferLog } from "../types/abi-interfaces/Erc20Abi";

async function checkGetAddress(addressID: string): Promise<Address> {
  let address = await Address.get(addressID.toLowerCase());
  if (!address) {
    address = new Address(addressID.toLowerCase());
    await address.save();
  }
  return address;
}

export async function handleLog(log: TransferLog): Promise<void> {
  if (log.args) {
    logger.info(`New transfer transaction log at block ${log.blockNumber}`);
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
}

export async function handleTransaction(
  tx: EthereumTransaction
): Promise<void> {
  if (tx.input === "0x" && tx.to && tx.from) {
    logger.info(`New transaction at block ${tx.blockNumber}`);
    const toAddress = await checkGetAddress(tx.to);
    const fromAddress = await checkGetAddress(tx.from);

    const transaction = NativeTokenTransaction.create({
      id: tx.hash,
      blockHeight: BigInt(tx.blockNumber),
      toId: toAddress.id,
      fromId: fromAddress.id,
      value: tx.value,
    });

    await transaction.save();
  }
}
