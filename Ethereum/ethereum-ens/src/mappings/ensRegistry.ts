import { createEventID, concat, ROOT_NODE, EMPTY_ADDRESS } from "./utils";
import { keccak256 } from "@ethersproject/keccak256";

// Import event types from the registry contract ABI
import {
  TransferEvent,
  NewTTLEvent,
} from "../types/contracts/Registry";

// Import entity types generated from the GraphQL schema
import {
  Account,
  Domain,
  Resolver,
  NewOwner,
  Transfer,
  NewResolver,
  NewTTL,
} from "../types";
import assert from "assert";
import {NewOwnerLog, NewResolverLog} from "../types/abi-interfaces/Registry";

function createDomain(node: string, timestamp: number = 0): Domain {
  let domain = Domain.create({
    id: node,
    ownerId: EMPTY_ADDRESS,
    isMigrated: true,
    createdAt: BigInt(timestamp),
    subdomainCount: 0,
  });
  return domain;
}

async function getDomain(
  node: string,
  timestamp: number = 0
): Promise<Domain | undefined> {
  let domain = await Domain.get(node);
  const emptyAddressAccount = await Account.get(EMPTY_ADDRESS);
  if (emptyAddressAccount === undefined) {
    const account = new Account(EMPTY_ADDRESS);
    await account.save();
  }
  if (domain == undefined && node == ROOT_NODE) {
    return createDomain(node, timestamp);
  } else {
    return domain;
  }
}

function makeSubnode(event: NewOwnerLog): string {
  if(!event.args){
    throw new Error(`NewOwnerLog ${event.blockNumber} - ${event.logIndex} args not exist`)
  }
  return keccak256(concat(event.args.node, event.args.label));
}

async function recurseDomainDelete(domain: Domain): Promise<string | null> {
  if (
    (domain.resolverId == null ||
      domain.resolverId == undefined ||
      domain.resolverId!.split("-")[0] == EMPTY_ADDRESS) &&
    domain.ownerId == EMPTY_ADDRESS &&
    domain.subdomainCount == 0
  ) {
    const parentDomain = await Domain.get(domain.parentId!);
    if (parentDomain != undefined) {
      parentDomain.subdomainCount = parentDomain.subdomainCount - 1;
      await parentDomain.save();
      return recurseDomainDelete(parentDomain);
    }

    return null;
  }

  return domain.id;
}

async function saveDomain(domain: Domain): Promise<void> {
  await recurseDomainDelete(domain);
  await domain.save();
}

// Handler for NewOwner events
async function _handleNewOwner(
  event: NewOwnerLog,
  isMigrated: boolean,
  subnode?: string
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);

  let account = new Account(event.args.owner);
  // await account.save()
  if (!subnode) {
    subnode = makeSubnode(event);
  }
  // let domain = await getDomain(subnode, event.block.timestamp)
  // let parent = await getDomain(event.args.node)
  const start2 = Date.now();

  let [domain, parent] = await Promise.all([
    getDomain(subnode, Number(event.block.timestamp.toString())),
    getDomain(event.args.node),
  ]);
  const end2 = Date.now();
  // logger.info(`_handleNewOwner-2 ${end2-start2} ms`)

  if (domain === undefined) {
    domain = Domain.create({
      id: subnode,
      ownerId: EMPTY_ADDRESS,
      isMigrated: false,
      createdAt: event.block.timestamp,
      subdomainCount: 0,
    });
  }
  if (
    (domain.parentId === null && parent !== undefined) ||
    (domain.parentId === undefined && parent !== undefined)
  ) {
    parent.subdomainCount = parent.subdomainCount + 1;
    const start3 = Date.now();
    await parent.save();
    const end3 = Date.now();
    // logger.info(`_handleNewOwner-3 ${end3-start3} ms`)
  }
  if (domain.name == null || domain.name == undefined) {
    // Get label and node names
    // let label = ens.nameByHash(event.params.label.toHexString())
    let label = event.args.label;
    if (label !== null && label !== undefined) {
      domain.labelName = label;
    }

    if (label === null || label == undefined) {
      label = "[" + event.args.label.slice(2) + "]";
    }
    if (event.args.node == ROOT_NODE) {
      domain.name = label;
    } else {
      parent = parent!;
      let name = parent?.name;
      if (label && name) {
        domain.name = label + "." + name;
      }
    }
  }
  domain.ownerId = event.args.owner;
  domain.parentId = event.args.node;
  domain.labelhash = event.args.label;
  domain.isMigrated = isMigrated;
  // await saveDomain(domain)

  let domainEvent = NewOwner.create({
    id: createEventID(event.blockNumber, event.logIndex),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    parentDomainId: event.args.node,
    domainId: subnode,
    ownerId: event.args.owner,
  });

  await Promise.all([account.save(), saveDomain(domain), domainEvent.save()]);
}

// Handler for Transfer events
export async function handleTransfer(event: TransferEvent): Promise<void> {
  let node = event.args.node;

  let account = new Account(event.args.owner);
  await account.save();

  // Update the domain owner
  let domain = await getDomain(node);

  if (domain) {
    domain.ownerId = event.args.owner;
    await saveDomain(domain);
  }

  let domainEvent = Transfer.create({
    id: createEventID(event.blockNumber, event.logIndex),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    domainId: node,
    ownerId: event.args.owner,
  });

  await domainEvent.save();
}

// Handler for NewResolver events
export async function handleNewResolver(
  event: NewResolverLog
): Promise<void> {
  assert(event.args, `expected args for event ${event.transactionHash}-${event.logIndex}`);
  let id = event.args.resolver.concat("-").concat(event.args.node);

  let node = event.args.node;
  let domain = await getDomain(node);
  assert(domain, `cant find domain id="${node}"`);
  domain.resolverId = id;

  let resolver = await Resolver.get(id);
  if (resolver == null || resolver == undefined) {
    resolver = Resolver.create({
      id,
      domainId: node,
      address: event.args.resolver,
    });
    await resolver.save();
  } else {
    domain.resolvedAddressId = resolver.addrId;
  }
  await saveDomain(domain);

  let domainEvent = NewResolver.create({
    id: createEventID(event.blockNumber, event.logIndex),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    domainId: node,
    resolverId: id,
  });

  await domainEvent.save();
}

// Handler for NewTTL events
export async function handleNewTTL(event: NewTTLEvent): Promise<void> {
  let node = event.args.node;
  let domain = await getDomain(node);
  // For the edge case that a domain's owner and resolver are set to empty
  // in the same transaction as setting TTL
  if (domain) {
    domain.ttl = event.args.ttl.toBigInt();
    await domain.save();
  }

  let domainEvent = NewTTL.create({
    id: createEventID(event.blockNumber, event.logIndex),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    domainId: node,
    ttl: event.args.ttl.toBigInt(),
  });

  await domainEvent.save();
}

export async function handleNewOwner(event: NewOwnerLog): Promise<void> {
  await _handleNewOwner(event, true);
}

export async function handleNewOwnerOldRegistry(
  event: NewOwnerLog
): Promise<void> {
  let subnode = makeSubnode(event);
  let domain = await getDomain(subnode);
  // logger.info(`handleNewOwnerOldRegistry getDomain ${end1-start1} ms`)

  if (domain == undefined || domain.isMigrated == false) {
    await _handleNewOwner(event, false, subnode);
  }
}

export async function handleNewResolverOldRegistry(
  event: NewResolverLog
): Promise<void> {
  if(!event.args){
    return
  }
  let node = event.args.node;
  let domain = await getDomain(node, Number(event.block.timestamp.toString()));
  if (node == ROOT_NODE || (domain !== undefined && !domain.isMigrated)) {
    await handleNewResolver(event);
  }
}
export async function handleNewTTLOldRegistry(
  event: NewTTLEvent
): Promise<void> {
  let domain = await getDomain(event.args.node);
  if (domain?.isMigrated == false) {
    await handleNewTTL(event);
  }
}

export async function handleTransferOldRegistry(
  event: TransferEvent
): Promise<void> {
  let domain = await getDomain(event.args.node);
  if (domain?.isMigrated == false) {
    await handleTransfer(event);
  }
}
