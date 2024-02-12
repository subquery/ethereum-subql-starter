// Import event types from the registry contract ABI
import assert from "assert";
import {
  FusesSetEvent,
  NameUnwrappedEvent,
  NameWrappedEvent,
  TransferBatchEvent,
  TransferSingleEvent,
} from "../types/contracts/NameWrapper";
// Import entity types generated from the GraphQL schema
import {
  FusesSet,
  NameUnwrapped,
  NameWrapped,
  WrappedDomain,
  WrappedTransfer,
} from "../types/models";
import {
  createEventID,
  createOrLoadAccount,
  createOrLoadDomain,
} from "./utils";
import { BigNumber } from "ethers";

function decodeName(buf: Buffer): Array<string> {
  let offset = 0;
  let list = new Buffer(0);
  let dot = Buffer.from("2e");
  let len = buf[offset++];
  let hex = "0x" + buf.toString();
  let firstLabel = "";
  if (len === 0) {
    return [firstLabel, "."];
  }

  while (len) {
    let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
    let labelBytes = Buffer.from(label);

    if (offset > 1) {
      list = Buffer.concat([list, dot]);
    } else {
      firstLabel = labelBytes.toString();
    }
    list = Buffer.concat([list, labelBytes]);
    offset += len;
    len = buf[offset++];
  }
  return [firstLabel, list.toString()];
}

export async function handleNameWrapped(
  event: NameWrappedEvent
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  let decoded = decodeName(Buffer.from(event.args.name));
  let label = decoded[0];
  let name = decoded[1];
  let node = event.args.node;
  let fuses = event.args.fuses;
  let blockNumber = event.blockNumber;
  let transactionID = event.transactionHash;
  let owner = await createOrLoadAccount(event.args.owner);
  let domain = await createOrLoadDomain(node);

  if (!domain.labelName) {
    domain.labelName = label;
    domain.name = name;
  }
  await domain.save();

  let wrappedDomain = WrappedDomain.create({
    id: node,
    domainId: domain.id,
    expiryDate: event.args.expiry.toBigInt(),
    fuses: fuses,
    ownerId: owner.id,
    labelName: name,
  });

  await wrappedDomain.save();

  let nameWrappedEvent = NameWrapped.create({
    id: createEventID(event.blockNumber, event.logIndex),
    domainId: domain.id,
    name,
    fuses,
    ownerId: owner.id,
    blockNumber,
    transactionID,
    expiry: event.args.expiry.toBigInt(),
  });
  await nameWrappedEvent.save();
}

export async function handleNameUnwrapped(
  event: NameUnwrappedEvent
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  let node = event.args.node;
  let blockNumber = event.blockNumber;
  let transactionID = event.transactionHash;
  let owner = await createOrLoadAccount(event.args.owner);

  let nameUnwrappedEvent = NameUnwrapped.create({
    id: createEventID(event.blockNumber, event.logIndex),
    domainId: node,
    ownerId: owner.id,
    blockNumber,
    transactionID,
  });

  await nameUnwrappedEvent.save();
  await WrappedDomain.remove(node);
}

export async function handleFusesSet(event: FusesSetEvent): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  let node = event.args.node;
  let fuses = event.args.fuses;
  let expiry = event.args.expiry;
  let blockNumber = event.blockNumber;
  let transactionID = event.transactionHash;
  let wrappedDomain = await WrappedDomain.get(node);

  if (wrappedDomain) {
    wrappedDomain.fuses = fuses;
    wrappedDomain.expiryDate = expiry.toBigInt();
    await wrappedDomain.save();
  }
  let fusesBurnedEvent = FusesSet.create({
    id: createEventID(event.blockNumber, event.logIndex),
    domainId: node,
    fuses,
    blockNumber,
    transactionID,
    expiry: event.args.expiry.toBigInt(),
  });
  await fusesBurnedEvent.save();
}

async function makeWrappedTransfer(
  blockNumber: number,
  transactionID: string,
  eventID: string,
  node: BigNumber,
  to: string
): Promise<void> {
  const _to = await createOrLoadAccount(to);
  const namehash = "0x" + node.toHexString().slice(2).padStart(64, "0");
  const domain = await createOrLoadDomain(namehash);
  let wrappedDomain = await WrappedDomain.get(namehash);
  // new registrations emit the Transfer` event before the NameWrapped event
  // so we need to create the WrappedDomain entity here
  if (!wrappedDomain) {
    wrappedDomain = WrappedDomain.create({
      id: namehash,
      ownerId: _to.id,
      domainId: domain.id,
      fuses: 0,
      expiryDate: BigInt(0),
    });
    await wrappedDomain.save();
  }

  const wrappedTransfer = WrappedTransfer.create({
    id: eventID,
    domainId: domain.id,
    ownerId: _to.id,
    blockNumber,
    transactionID,
  });
  await wrappedTransfer.save();
}

export async function handleTransferSingle(
  event: TransferSingleEvent
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  await makeWrappedTransfer(
    event.blockNumber,
    event.transactionHash,
    createEventID(event.blockNumber, event.logIndex).concat("-0"),
    event.args.id,
    event.args.to
  );
}

export async function handleTransferBatch(
  event: TransferBatchEvent
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  let blockNumber = event.blockNumber;
  let transactionID = event.transactionHash;
  let ids = event.args.ids;
  let to = event.args.to;
  //TODO, use promise.all
  for (let i = 0; i < ids.length; i++) {
    await makeWrappedTransfer(
      blockNumber,
      transactionID,
      createEventID(event.blockNumber, event.logIndex)
        .concat("-")
        .concat(i.toString()),
      ids[i],
      to
    );
  }
}
