import { TransferEvent } from "../types/contracts/BaycAbi";
import { Transfer, BoredApe, Property } from "../types";
import { BaycAbi__factory } from "../types/contracts";
import fetch from "node-fetch";

export async function handleTransfer(event: TransferEvent): Promise<void> {
  let transfer = Transfer.create({
    id: event.transactionHash + event.logIndex,
    from: event.args.from,
    to: event.args.to,
    tokenId: event.args.tokenId.toBigInt(),
    blockNumber: BigInt(event.blockNumber),
    transactionHash: event.transactionHash,
  });
  transfer.save();

  let contractAddress = BaycAbi__factory.connect(event.address, api);
  let boredApe = await BoredApe.get(event.args.tokenId.toString());

  if (boredApe == undefined) {
    boredApe = BoredApe.create({
      id: event.args.tokenId.toString(),
      creator: event.args.to,
      tokenURI: await contractAddress.tokenURI(event.args.tokenId),
      newOwner: event.args.to,
      blockNumber: BigInt(event.blockNumber),
    });
  }

  boredApe.newOwner = event.args.to;
  boredApe.blockNumber = BigInt(event.blockNumber);
  boredApe.save();

  const ipfshash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";
  let tokenURI = "/" + event.args.tokenId.toString();

  let property = await Property.get(event.args.tokenId.toString());

  if (property == null) {
    let fullURI = ipfshash + tokenURI;

    let content = await (await fetch("https://ipfs.io/ipfs/" + fullURI)).json();

    if (content) {
      let image = content.image;
      let attributes = content.attributes;
      let background: string | undefined = undefined;
      let clothes: string | undefined = undefined;
      let earring: string | undefined = undefined;
      let eyes: string | undefined = undefined;
      let fur: string | undefined = undefined;
      let hat: string | undefined = undefined;
      let mouth: string | undefined = undefined;
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
                background = value;
              }

              if (trait == "Clothes") {
                clothes = value;
              }

              if (trait == "Earring") {
                earring = value;
              }

              if (trait == "Eyes") {
                eyes = value;
              }

              if (trait == "Fur") {
                fur = value;
              }

              if (trait == "Hat") {
                hat = value;
              }

              if (trait == "Mouth") {
                mouth = value;
              }
            }
          }
        }
      }
      let property = await Property.create({
        id: event.args.tokenId.toString(),
        image: image,
        background: background,
        earring: earring,
        eyes: eyes,
        fur: fur,
        hat: hat,
        mouth: mouth,
        clothes: clothes,
      });
      property.save();
    }
  }
}
