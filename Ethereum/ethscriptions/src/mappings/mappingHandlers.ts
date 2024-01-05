import { Inscription } from "../types";
import { isValidDataUri, hexToUTF8 } from "./utils";
import { EthereumTransaction } from "@subql/types-ethereum";

export async function handleTransaction(
  tx: EthereumTransaction
): Promise<void> {
  if (tx.to) {
    if (!tx.input) {
      return;
    }
    let inscription: Inscription;
    const decodedData = hexToUTF8(tx.input);
    if (isValidDataUri(decodedData)) {
      inscription = Inscription.create({
        id: tx.hash,
        data: decodedData,
        block: tx.blockNumber,
        creator: tx.from,
        created: new Date(Number(tx.blockTimestamp) * 1000),
      });
      inscription.save();
    }
  }
}
