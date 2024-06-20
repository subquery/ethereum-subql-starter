import { ProxyCreationLog as ProxyCreation_v1_0_0 } from "../types/abi-interfaces/GnosisSafeProxyFactory_v100";
import { ProxyCreationLog as ProxyCreation_v1_1_1 } from "../types/abi-interfaces/GnosisSafeProxyFactory_v111";
import { ProxyCreationLog as ProxyCreation_v1_3_0 } from "../types/abi-interfaces/GnosisSafeProxyFactory_v130";

import { SignMsgLog } from "../types/abi-interfaces/GnosisSafe";
import { createGnosisSafeDatasource as GnosisSafeContract } from "../types";
import { GnosisSafe__factory } from "../types/contracts";
import { Sig } from "../types";
import assert from "assert";

async function handleProxyCreation(proxyAddress: string): Promise<void> {
  let safeInstance = GnosisSafe__factory.connect(proxyAddress, api);
  let callGetOwnerResult = await safeInstance.getOwners();
  if (callGetOwnerResult) GnosisSafeContract({ proxyAddress });
  logger.warn(`Created a datasource for ${proxyAddress}`);
}

export async function handleProxyCreation_1_0_0(
  event: ProxyCreation_v1_0_0,
): Promise<void> {
  assert(event.args, "No args in log");
  logger.warn("handleProxyCreation_1_0_0 is tiggered");
  await handleProxyCreation(event.args.proxy);
}

export async function handleProxyCreation_1_1_1(
  event: ProxyCreation_v1_1_1,
): Promise<void> {
  assert(event.args, "No args in log");
  logger.warn("handleProxyCreation_1_1_0 is tiggered");
  await handleProxyCreation(event.args.proxy);
}

export async function handleProxyCreation_1_3_0(
  event: ProxyCreation_v1_3_0,
): Promise<void> {
  assert(event.args, "No args in log");
  logger.warn("handleProxyCreation_1_3_0 is tiggered");
  await handleProxyCreation(event.args.proxy);
}

async function createSig(event: SignMsgLog, network: string): Promise<void> {
  logger.warn("createSig is tiggered");
  let sig = await Sig.create({
    id: event.transaction.hash,
    account: event.address,
    msgHash: event.topics[1].slice(2),
    timestamp: event.block.timestamp,
    network: network,
  });
  sig.save();
}

export async function handleEthSignMsg(event: SignMsgLog): Promise<void> {
  await createSig(event, "ethereum");
}

export async function handleMaticSignMsg(event: SignMsgLog): Promise<void> {
  await createSig(event, "matic");
}

export async function handleOpSignMsg(event: SignMsgLog): Promise<void> {
  await createSig(event, "op");
}
