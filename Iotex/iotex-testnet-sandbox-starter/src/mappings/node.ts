import assert from "assert";
import { Blockchain, IotexNode } from "../types";
// import { NodeRegisteredLod, NodeUpdatedLog, TransferLog } from "../..";
import { NodeRegisteredLog, NodeUpdatedLog, TransferLog } from "../types/abi-interfaces/NodeRegistry";

export async function handleNodeRegister(event: NodeRegisteredLog): Promise<void> {
  let blockchain = await Blockchain.get("IoTeX");
  assert(blockchain)
  if (blockchain === undefined) {
    blockchain = Blockchain.create({id: "IoTeX", totalNode: BigInt(0), totalProject: BigInt(0), totalReceiver: BigInt(0)});
    await blockchain.save();
  }
  blockchain.totalNode = blockchain.totalNode + BigInt(1)
  await blockchain.save();

  assert(event.args)
  let node = await IotexNode.get(event.args.nodeId.toString());
  if (node === undefined) {
    node = IotexNode.create({id: event.args.nodeId.toString(), owner: event.args.owner, operator: event.args.operator, createdAt: event.block.timestamp, updatedAt: event.block.timestamp});
    node.save();
  }
}

export async function handleNodeUpdate(event: NodeUpdatedLog): Promise<void> {
  assert(event.args)
  let node = await  IotexNode.get(event.args.nodeId.toString());
  if (node !== undefined) {
    node.operator = event.args.operator;
    node.updatedAt = event.block.timestamp;
    await node.save();
  }
}

export async function handleNodeTransfer(event: TransferLog): Promise<void> {
  assert(event.args)
  let node = await IotexNode.get(event.args.tokenId.toString());
  if (node !== undefined) {
    node.owner = event.args.to;
    node.updatedAt = event.block.timestamp;
    await node.save();
  }
}
