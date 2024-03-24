// import { BigInt, Bytes } from "@graphprotocol/graph-ts";
// import { Blockchain, Project } from "../generated/schema";
// import {
//   ProjectPaused,
//   ProjectUnpaused,
//   ProjectUpserted,
//   Transfer,
// } from "../generated/ProjectRegistrar/ProjectRegistrar";

import assert from "assert";
import { Blockchain, Project } from "../types";
import { ProjectPausedLog, ProjectUnpausedLog, ProjectUpsertedLog, TransferLog } from "../types/abi-interfaces/ProjectRegistrar";

export async function handleProjectUpsert(event: ProjectUpsertedLog): Promise<void> {
  let blockchain = await Blockchain.get("IoTeX");
  if (blockchain === undefined) {
    blockchain = Blockchain.create({id: "IoTeX", totalNode: BigInt(0), totalProject: BigInt(0), totalReceiver: BigInt(0)});
    await blockchain.save();
  }
  assert(event.args)
  let project = await Project.get(event.args.projectId.toString());

  if (project === undefined) {
    project = Project.create({id: event.args.projectId.toString(), paused: false, owner: event.transaction.from, receiver: "0x0000000000000000000000000000000000000000", hash: event.args.hash, uri: event.args.uri, createdAt: event.block.timestamp, updatedAt: event.block.timestamp});
    await project.save();

    blockchain.totalProject = blockchain.totalProject + BigInt(1)
    await blockchain.save();
  } else {
    project.hash = event.args.hash;
    project.uri = event.args.uri;
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}

export async function handleProjectTransfer(event: TransferLog): Promise<void> {
  assert(event.args)
  let project = await Project.get(event.args.tokenId.toString());
  if (project !== undefined) {
    project.owner = event.args.to;
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}

export async function handleProjectPause(event: ProjectPausedLog): Promise<void> {
  assert(event.args)
  let project = await Project.get(event.args.projectId.toString());
  if (project !== undefined) {
    project.paused = true;
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}

export async function handleProjectUnpause(event: ProjectUnpausedLog): Promise<void> {
  assert(event.args)
  let project = await Project.get(event.args.projectId.toString());
  if (project !== undefined) {
    project.paused = false;
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}
