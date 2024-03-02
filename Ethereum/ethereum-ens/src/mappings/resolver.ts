import {
  ABIChangedEvent,
  AddrChangedEvent,
  AddressChangedEvent,
  AuthorisationChangedEvent,
  ContenthashChangedEvent,
  InterfaceChangedEvent,
  NameChangedEvent,
  PubkeyChangedEvent,
  VersionChangedEvent,
  TextChanged_bytes32_string_string_Event as TextChangedEvent,
  TextChanged_bytes32_string_string_string_Event as TextChangedWithValueEvent,
} from "../types/contracts/PublicResolver";

import {
  AbiChanged,
  Account,
  AddrChanged,
  AuthorisationChanged,
  ContenthashChanged,
  Domain,
  InterfaceChanged,
  MulticoinAddrChanged,
  NameChanged,
  PubkeyChanged,
  Resolver,
  TextChanged,
  VersionChanged,
} from "../types/models";
import { createEventID } from "./utils";

export async function handleAddrChanged(
  event: AddrChangedEvent
): Promise<void> {
  let account = new Account(event.args.a);
  await account.save();

  let resolver = Resolver.create({
    id: createResolverID(event.args.node, event.address),
    domainId: event.args.node,
    address: event.address,
    addrId: event.args.a,
  });
  await resolver.save();

  let domain = await Domain.get(event.args.node);
  if (domain && domain.resolverId == resolver.id) {
    domain.resolvedAddressId = event.args.a;
    await domain.save();
  }

  let resolverEvent = AddrChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: resolver.id,
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    addrId: event.args.a,
  });
  await resolverEvent.save();
}

export async function handleMulticoinAddrChanged(
  event: AddressChangedEvent
): Promise<void> {
  let resolver = await getOrCreateResolver(event.args.node, event.address);
  let coinType = event.args.coinType;
  if (resolver.coinTypes == null || resolver.coinTypes == undefined) {
    resolver.coinTypes = [coinType.toBigInt()];
    await resolver.save();
  } else {
    let coinTypes = resolver.coinTypes!;
    if (!coinTypes.includes(coinType.toBigInt())) {
      coinTypes.push(coinType.toBigInt());
      resolver.coinTypes = coinTypes;
      await resolver.save();
    }
  }

  let resolverEvent = MulticoinAddrChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: resolver.id,
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    coinType: coinType.toBigInt(),
    addr: event.args.newAddress,
  });
  await resolverEvent.save();
}

export async function handleNameChanged(
  event: NameChangedEvent
): Promise<void> {
  if (event.args.name.indexOf("\u0000") != -1) return;

  let resolverEvent = NameChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    name: event.args.name,
  });
  resolverEvent.resolverId = createResolverID(event.args.node, event.address);
  resolverEvent.blockNumber = event.blockNumber;
  resolverEvent.transactionID = event.transactionHash;
  resolverEvent.name = event.args.name;
  await resolverEvent.save();
}

export async function handleABIChanged(event: ABIChangedEvent): Promise<void> {
  let resolverEvent = AbiChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    contentType: event.args.contentType.toBigInt(),
  });
  await resolverEvent.save();
}

export async function handlePubkeyChanged(
  event: PubkeyChangedEvent
): Promise<void> {
  let resolverEvent = PubkeyChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    x: event.args.x,
    y: event.args.y,
  });
  await resolverEvent.save();
}

export async function handleTextChanged(
  event: TextChangedEvent
): Promise<void> {
  let resolver = await getOrCreateResolver(event.args.node, event.address);
  const key = event.args[2];

  if (resolver.texts == null || resolver.texts == undefined) {
    resolver.texts = [key];
    await resolver.save();
  } else {
    let texts = resolver.texts!;
    if (!texts.includes(key)) {
      texts.push(key);
      resolver.texts = texts;
      await resolver.save();
    }
  }

  let resolverEvent = TextChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    key,
  });
  await resolverEvent.save();
}

export async function handleTextChangedWithValue(
  event: TextChangedWithValueEvent
): Promise<void> {
  let resolver = await getOrCreateResolver(event.args.node, event.address);
  let key = event.args.key;
  if (resolver.texts == null || resolver.texts == undefined) {
    resolver.texts = [key];
    await resolver.save();
  } else {
    let texts = resolver.texts!;
    if (!texts.includes(key)) {
      texts.push(key);
      resolver.texts = texts;
      await resolver.save();
    }
  }

  let resolverEvent = TextChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    key: event.args.key,
    value: event.args.value,
  });
  await resolverEvent.save();
}

export async function handleContentHashChanged(
  event: ContenthashChangedEvent
): Promise<void> {
  let resolver = await getOrCreateResolver(event.args.node, event.address);
  resolver.contentHash = event.args.hash;
  await resolver.save();

  let resolverEvent = ContenthashChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    hash: event.args.hash,
  });
  await resolverEvent.save();
}

export function handleInterfaceChanged(event: InterfaceChangedEvent): void {
  let resolverEvent = InterfaceChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    interfaceID: event.args.interfaceID,
    implementer: event.args.implementer,
  });
  resolverEvent.save();
}

export async function handleAuthorisationChanged(
  event: AuthorisationChangedEvent
): Promise<void> {
  let resolverEvent = AuthorisationChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    owner: event.args.owner,
    target: event.args.target,
    isAuthorized: event.args.isAuthorised,
  });
  await resolverEvent.save();
}

export async function handleVersionChanged(
  event: VersionChangedEvent
): Promise<void> {
  let resolverEvent = VersionChanged.create({
    id: createEventID(event.blockNumber, event.logIndex),
    resolverId: createResolverID(event.args.node, event.address),
    blockNumber: event.blockNumber,
    transactionID: event.transactionHash,
    version: event.args.newVersion.toBigInt(),
  });
  await resolverEvent.save();

  let domain = await Domain.get(event.args.node);
  if (domain && domain.resolverId === resolverEvent.resolverId) {
    domain.resolvedAddressId = undefined;
    await domain.save();
  }

  let resolver = await getOrCreateResolver(event.args.node, event.address);
  if (resolver) {
    resolver.addrId = undefined;
    resolver.contentHash = undefined;
    resolver.texts = undefined;
    resolver.coinTypes = undefined;
    await resolver.save();
  }
}

async function getOrCreateResolver(
  node: string,
  address: string
): Promise<Resolver> {
  let id = createResolverID(node, address);
  let resolver = await Resolver.get(id);
  if (resolver === null || resolver === undefined) {
    resolver = Resolver.create({
      id,
      domainId: node,
      address,
    });
  }
  return resolver as Resolver;
}

function createResolverID(node: string, resolver: string): string {
  return resolver.concat("-").concat(node);
}
