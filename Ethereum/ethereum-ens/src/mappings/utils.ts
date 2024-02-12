// Import types and APIs from graph-ts

import { Account, Domain } from "../types/models";
export function createEventID(blockNumber: number, logIndex: number): string {
  return blockNumber.toString().concat("-").concat(logIndex.toString());
}

declare type u32 = number;

export const ETH_NODE = '0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae'
export const ROOT_NODE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

// Helper for concatenating two string to byteArray
export function concat(_a: string, _b: string): Uint8Array {
  return Buffer.from(_a + _b);
}

export function concatBuffer(_a: string, _b: string): Uint8Array {
  return Buffer.from(_a + _b);
}

export function byteArrayFromHex(s: string): Uint8Array {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }
  let out = new Uint8Array(s.length / 2);
  for (var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32;
  }
  return out;
}

// From a hex string
export function uint256ToByteArray(i: string): Uint8Array {
  let hex = i.slice(2).padStart(64, "0");
  return byteArrayFromHex(hex);
}

export async function createOrLoadAccount(address: string): Promise<Account> {
  let account = await Account.get(address);
  if (account == null || account == undefined) {
    account = new Account(address);
    await account.save();
  }
  return account;
}

export async function createOrLoadDomain(node: string): Promise<Domain> {
  let domain = await Domain.get(node);
  if (domain == null || domain == undefined) {
    domain = Domain.create({
      id: node,
      subdomainCount: 0,
      ownerId: "",
      isMigrated: false,
      createdAt: BigInt(0),
    });
    await domain.save();
  }
  return domain;
}
