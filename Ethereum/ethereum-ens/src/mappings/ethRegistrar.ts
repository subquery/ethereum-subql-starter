import {
  byteArrayFromHex,
  concat,
  createEventID,
  uint256ToByteArray,
} from "./utils";

// Import event types from the registry contract ABI
import {
  NameRegisteredEvent,
  NameRenewedEvent,
  TransferEvent,
} from "../types/contracts/BaseRegistrar";

import { NameRegisteredEvent as ControllerNameRegisteredEventOld } from "../types/contracts/EthRegistrarControllerOld";

import {
  NameRegisteredEvent as ControllerNameRegisteredEvent,
  NameRenewedEvent as ControllerNameRenewedEvent,
} from "../types/contracts/EthRegistrarController";

// Import entity types generated from the GraphQL schema
import {
  Account,
  Domain,
  NameRegistered,
  NameRenewed,
  NameTransferred,
  Registration,
} from "../types/models";
import { keccak256 } from "@ethersproject/keccak256";
import assert from "assert";
import {NameRegisteredLog} from "../types/abi-interfaces/EthRegistrarController";

var rootNode = byteArrayFromHex(
  "93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae"
);

export async function handleNameRegistered(
  event: NameRegisteredLog
): Promise<void> {
  if(!event.args){
    return
  }
  let account = new Account(event.args.owner);
  await account.save();

  let label = uint256ToByteArray(event.args.label);
  let domain = await Domain.get(
    keccak256(concat(rootNode.toString(), label.toString()))
  );

  assert(domain, "can't find domain");

  let registration = Registration.create({
    id: label.toString(),
    domainId: domain.id,
    registrationDate: event.block.timestamp,
    expiryDate: event.args.expires.toBigInt(),
    registrantId: account.id,
  });

  //  let labelName = ens.nameByHash(label.toHexString())
  let labelName = label.toString();
  if (labelName != null && labelName != undefined) {
    domain.labelName = labelName;
    domain.name = labelName + ".eth";
    registration.labelName = labelName;
  }

  await Promise.all([domain.save(), registration.save()]);

  let registrationEvent = NameRegistered.create({
    id: createEventID(event.blockNumber, event.logIndex),
    registrationId: registration.id,
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    registrantId: account.id,
    expiryDate: event.args.expires.toBigInt(),
  });

  await registrationEvent.save();
}

export async function handleNameRegisteredByControllerOld(
  event: ControllerNameRegisteredEventOld
): Promise<void> {
  await setNamePreimage(
    event.args.name,
    event.args.label,
    event.args.cost.toBigInt()
  );
}

export async function handleNameRegisteredByController(
  event: ControllerNameRegisteredEvent
): Promise<void> {
  await setNamePreimage(
    event.args.name,
    event.args.label,
    event.args.baseCost.add(event.args.premium).toBigInt()
  );
}

export async function handleNameRenewedByController(
  event: ControllerNameRenewedEvent
): Promise<void> {
  await setNamePreimage(
    event.args.name,
    event.args.label,
    event.args.cost.toBigInt()
  );
}

function checkValidLabel(name: string): boolean {
  for (let i = 0; i < name.length; i++) {
    let c = name.charCodeAt(i);
    if (c === 0) {
      logger.warn("Invalid label '{}' contained null byte. Skipping.", [name]);
      return false;
    } else if (c === 46) {
      logger.warn(
        "Invalid label '{}' contained separator char '.'. Skipping.",
        [name]
      );
      return false;
    }
  }

  return true;
}

async function setNamePreimage(
  name: string,
  label: string,
  cost: bigint
): Promise<void> {
  if (!checkValidLabel(name)) {
    return;
  }

  let domain = await Domain.get(keccak256(concat(rootNode.toString(), label)));
  if (domain && domain.labelName !== name) {
    domain.labelName = name;
    domain.name = name + ".eth";
    await domain.save();
  }

  let registration = await Registration.get(label);
  if (registration == null || registration == undefined) return;
  registration.labelName = name;
  registration.cost = cost;
  await registration.save();
}

export async function handleNameRenewed(
  event: NameRenewedEvent
): Promise<void> {
  let label = uint256ToByteArray(event.args.id.toHexString());
  // let label = event.args.id.toHexString()
  let registration = await Registration.get(label.toString());
  assert(registration, "Cant find registration");
  registration.expiryDate = event.args.expires.toBigInt();
  await registration.save();

  let registrationEvent = NameRenewed.create({
    id: createEventID(event.blockNumber, event.logIndex),
    registrationId: registration.id,
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    expiryDate: event.args.expires.toBigInt(),
  });

  await registrationEvent.save();
}

export async function handleNameTransferred(
  event: TransferEvent
): Promise<void> {
  let account = new Account(event.args.to);
  await account.save();

  let label = uint256ToByteArray(event.args.tokenId.toHexString());
  let registration = await Registration.get(label.toString());
  if (registration == null || registration == undefined) return;

  registration.registrantId = account.id;
  await registration.save();

  let transferEvent = NameTransferred.create({
    id: createEventID(event.blockNumber, event.logIndex),
    registrationId: label.toString(),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    newOwnerId: account.id,
  });

  await transferEvent.save();
}
