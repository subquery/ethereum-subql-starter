import {
  NewGravatarLog,
  UpdatedGravatarLog,
} from "../types/abi-interfaces/Gravity";
import { Gravatar } from "../types";
import assert from "assert";

export async function handleNewGravatar(log: NewGravatarLog): Promise<void> {
  logger.info("New Gravar at block " + log.blockNumber.toString());

  assert(log.args, "Require args on the logs");

  const gravatar = Gravatar.create({
    id: log.args.id.toHexString()!,
    owner: log.args.owner,
    displayName: log.args.displayName,
    imageUrl: log.args.imageUrl,
    createdBlock: BigInt(log.blockNumber),
  });

  await gravatar.save();
}

export async function handleUpdatedGravatar(
  log: UpdatedGravatarLog
): Promise<void> {
  logger.info("Updated Gravar at block " + log.blockNumber.toString());

  assert(log.args, "Require args on the logs");

  const id: string = log.args.id.toHexString()!;

  // We first check if the Gravatar already exists, if not we create it
  let gravatar = await Gravatar.get(id);
  if (gravatar == null || gravatar == undefined) {
    gravatar = Gravatar.create({
      id,
      createdBlock: BigInt(log.blockNumber),
      owner: "",
      displayName: "",
      imageUrl: "",
    });
  }
  // Update with new data
  gravatar.owner = log.args.owner;
  gravatar.displayName = log.args.displayName;
  gravatar.imageUrl = log.args.imageUrl;
  await gravatar.save();
}
