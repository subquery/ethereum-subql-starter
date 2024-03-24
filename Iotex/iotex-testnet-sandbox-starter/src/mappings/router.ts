// import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
// import { Blockchain, Project, RouterData } from "../generated/schema";
// import { DataReceived, ReceiverRegistered, ReceiverUnregistered } from "../generated/W3bstreamRouter/W3bstreamRouter";

import assert from "assert";
import { Blockchain, Project, RouterData } from "../types";
import { DataReceivedLog, ReceiverRegisteredLog, ReceiverUnregisteredLog } from "../types/abi-interfaces/W3bstreamRouter";

export async function handleReceiverRegister(event: ReceiverRegisteredLog): Promise<void> {
  let blockchain = await Blockchain.get("IoTeX");
  if (blockchain !== undefined) {
    blockchain.totalReceiver = blockchain.totalReceiver + BigInt(1);
    await blockchain.save();
  }

  assert(event.args)
  let project = await Project.get(event.args.projectId.toString());
  if (project !== undefined) {
    project.receiver = event.args.receiver;
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}

export async function handleReceiverUnregister(event: ReceiverUnregisteredLog): Promise<void> {
  assert(event.args)
  let project = await Project.get(event.args.projectId.toString());
  if (project !== undefined) {
    project.receiver = "0x0000000000000000000000000000000000000000";
    project.updatedAt = event.block.timestamp;
    await project.save();
  }
}

export async function handleDataReceive(event: DataReceivedLog): Promise<void> {
  // const data = new RouterData(id: event.transaction.hash.toHexString());

  // const input = ethereum.decode(
  //   '(uint256,address)',
  //   Bytes.fromHexString('0x' + event.transaction.input.toHexString().substring(10, 138))
  // );
  // if (input) {
  //   const decoded = input.toTuple();
  //   data.project = decoded[0].toBigInt().toString();
  //   data.receiver = decoded[1].toAddress();
  // }

  // data.success = event.params.success;
  // data.operator = event.params.operator;
  // data.input = event.transaction.input;
  // data.reason = event.params.revertReason;
  // data.createdAt = event.block.timestamp;
  // data.save();
}
