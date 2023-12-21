// import { TypeormDatabase } from "@subsquid/typeorm-store";
// import { Inscription } from "./model";
// import { processor } from "./processor";
import assert from "assert";
import { Inscription } from "../types";
import { isValidDataUri, hexToUTF8 } from "./utils";
import { EthereumTransaction } from "@subql/types-ethereum";

export async function handleTransaction(
  tx: EthereumTransaction
): Promise<void> {
  logger.warn(tx.hash);
  const knownInscriptionsArray: Inscription[] | undefined =
    await Inscription.getByIsEsip6(false);
  assert(knownInscriptionsArray);
  const knownInscriptions: Map<string, Inscription> = new Map(
    knownInscriptionsArray.map((c) => [c.data, c])
  );
  const newUniqueInscriptions: Map<string, Inscription> = new Map();
  const inscriptions: Inscription[] = [];
  if (tx.to) {
    //is unique or has rule=esip6

    if (!tx.input) {
      return;
    }

    const decodedData = hexToUTF8(tx.input);
    //console.log(decodedData);
    if (isValidDataUri(decodedData)) {
      if (decodedData.includes("rule=esip6")) {
        inscriptions.push(
          Inscription.create({
            id: tx.hash,
            data: decodedData,
            block: tx.blockNumber,
            creator: tx.from,
            isEsip6: true,
          })
        );
      } else if (
        !knownInscriptions.has(decodedData) &&
        !newUniqueInscriptions.has(decodedData)
      ) {
        //console.log("new");
        newUniqueInscriptions.set(
          decodedData,
          Inscription.create({
            id: tx.hash,
            data: decodedData,
            block: tx.blockNumber,
            creator: tx.from,
            isEsip6: false,
          })
        );
      }
      //checkuniquesness
    }
  }
  inscriptions.map(async (inscription) => await inscription.save());
  if (newUniqueInscriptions.size > 0) {
    newUniqueInscriptions.forEach(async (value, key) => {
      await value.save();
    });
  }
}
