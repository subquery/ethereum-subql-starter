// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import {StarterEntity} from "../types";
import {Extrinsic, EventRecord, SignedBlock} from '@polkadot/types/interfaces';

export interface Entity {
  id: string;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export interface Store {
  get(entity: string, id: string): Promise<Entity | null>;
  getByField(entity: string, field: string, value): Promise<Entity[]>;
  getOneByField(entity: string, field: string, value): Promise<Entity | null>;
  set(entity: string, id: string, data: Entity): Promise<void>;
  bulkCreate(entity: string, data: Entity[]): Promise<void>;
  remove(entity: string, id: string): Promise<void>;
}

export interface SubstrateBlock extends SignedBlock {
  // parent block's spec version, can be used to decide the correct metadata that should be used for this block.
  specVersion: number;
  timestamp: Date;
  events: EventRecord[];
}

export interface SubstrateExtrinsic {
  // index in the block
  idx: number;
  extrinsic: Extrinsic;
  block: SubstrateBlock;
  events: EventRecord[];
  success: boolean;
}

export interface SubstrateEvent extends EventRecord {
  // index in the block
  idx: number;
  extrinsic?: SubstrateExtrinsic;
  block: SubstrateBlock;
}

export type AlgorandBlock = Record<string, any>;

export type AvalancheBlock = Record<string, any>;

export type AvalancheTransaction = Record<string, any>;

export interface BlockWrapper {
  getBlock: () => SubstrateBlock | AlgorandBlock | AvalancheBlock;
  getBlockHeight: () => number;
  getHash: () => string;
  getCalls?: (filters?: any) => SubstrateExtrinsic[] | AvalancheTransaction[];
}

export type DynamicDatasourceCreator = (name: string, args: Record<string, unknown>) => Promise<void>;

export async function handleBlock(block: BlockWrapper): Promise<void> {
    const record = new StarterEntity(block.getHash());
    record.height = block.getBlockHeight();
    await record.save();
}

export async function handleCall(transaction: AvalancheTransaction): Promise<void> {
    const record = await StarterEntity.get(transaction.blockHash);
    if (record.transactions) {
      const transactions = JSON.parse(record.transactions);
      transactions.push(transaction)
      record.transactions = JSON.stringify(transactions)
    } else {
      record.transactions = JSON.stringify([transaction]);
    }
    await record.save();
}