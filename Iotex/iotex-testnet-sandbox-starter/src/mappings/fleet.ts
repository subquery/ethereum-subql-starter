import {
  NodeAllowedLog,
  NodeDisallowedLog,
} from "../types/abi-interfaces/FleetManager";
import { ProjectNode } from "../types";
import assert from "assert";

export async function handleNodeAllow(event: NodeAllowedLog): Promise<void> {
  const id =
    event.args?.projectId.toString() + "-" + event.args?.nodeId.toString();
  let pn = await ProjectNode.get(id);

  if (pn === undefined) {
    const projectid = event.args?.projectId.toString();
    const nodeid = event.args?.nodeId.toString();
    assert(projectid);
    assert(nodeid);
    pn = ProjectNode.create({
      id: id,
      projectId: projectid,
      nodeId: nodeid,
      binded: true,
    });
    await pn.save();
  }
}

export async function handleNodeDisallow(
  event: NodeDisallowedLog
): Promise<void> {
  const id =
    event.args?.projectId.toString() + "-" + event.args?.nodeId.toString();
  let pn = await ProjectNode.get(id);
  if (pn !== undefined) {
    pn.binded = false;
    pn.save();
  }
}
