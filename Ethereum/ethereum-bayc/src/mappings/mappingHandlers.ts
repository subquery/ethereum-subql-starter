import { TransferLog } from "../types/abi-interfaces/BaycAbi";
import { Transfer, BoredApe, Properties, Mint } from "../types";
import { MintApeTransaction } from "../types/abi-interfaces/BaycAbi";
import fetch from "node-fetch";
import assert from "assert";

async function getOrCreateApe(event: TransferLog): Promise<BoredApe> {
  assert(event.args);
  let boredApe = await BoredApe.get(event.args.tokenId.toString());

  if (boredApe == undefined) {
    const ipfshash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";
    let tokenURI = "/" + event.args.tokenId.toString();
    let fullURI = ipfshash + tokenURI;

    let content = await (await fetch("https://ipfs.io/ipfs/" + fullURI)).json();

    const properties: Properties = {};

    if (content) {
      properties.image = content.image;
      let attributes = content.attributes;
      if (attributes) {
        for (const attribute of attributes) {
          let trait_type = attribute.trait_type;
          let value_type = attribute.value;

          let trait: string;
          let value: string;

          if (trait_type && value_type) {
            trait = trait_type.toString();
            value = value_type.toString();

            if (trait && value) {
              if (trait == "Background") {
                properties.background = value;
              }

              if (trait == "Clothes") {
                properties.clothes = value;
              }

              if (trait == "Earring") {
                properties.earring = value;
              }

              if (trait == "Eyes") {
                properties.eyes = value;
              }

              if (trait == "Fur") {
                properties.fur = value;
              }

              if (trait == "Hat") {
                properties.hat = value;
              }

              if (trait == "Mouth") {
                properties.mouth = value;
              }
            }
          }
        }
      }
    }

    boredApe = BoredApe.create({
      id: event.args.tokenId.toString(),
      creator: event.args.to,
      currentOwner: event.args.to,
      blockNumber: BigInt(event.blockNumber),
      prorepties: properties,
    });
  }

  boredApe.save();
  return boredApe;
}

export async function handleMint(
  transaction: MintApeTransaction,
): Promise<void> {
  assert(transaction.logs);
  let transferLog: TransferLog = transaction.logs.find(
    (e) =>
      e.topics[0] ===
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  ) as TransferLog;
  let boredApe = await getOrCreateApe(transferLog);
  let mint = Mint.create({
    id: transaction.hash.toString(),
    minter: transaction.from.toString(),
    boredApeId: boredApe.id,
    timestamp: transaction.blockTimestamp,
    date: new Date(Number(transaction.blockTimestamp)),
  });
  mint.save();
}

export async function handleTransfer(event: TransferLog): Promise<void> {
  assert(event.args);
  let boredApe = await getOrCreateApe(event);

  let transfer = Transfer.create({
    id: event.transactionHash + event.logIndex,
    from: event.args.from,
    to: event.args.to,
    tokenId: event.args.tokenId.toBigInt(),
    blockNumber: BigInt(event.blockNumber),
    transactionHash: event.transactionHash,
    timestamp: event.transaction.blockTimestamp,
    date: new Date(Number(event.transaction.blockTimestamp)),
    boredApeId: boredApe.id,
  });
  transfer.save();

  boredApe.currentOwner = event.args.to;
  boredApe.blockNumber = BigInt(event.blockNumber);
  boredApe.save();
}
