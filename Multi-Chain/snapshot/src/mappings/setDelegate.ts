import assert from "assert";
import { Delegation } from "../types";
import { SetDelegateLog } from "../types/abi-interfaces/DelegateRegistry";

export async function handleEthereumSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "ethereum");
}

export async function handleBSCSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "bsc");
}

export async function handleArbitrumSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "arbitrum");
}

export async function handleFantomSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "fantom");
}

export async function handleGnosisSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "gnosis");
}

export async function handleGoerliSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "goerli");
}

export async function handleMaticSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "matic");
}

export async function handleOPSetDelegateEvent(
  event: SetDelegateLog
): Promise<void> {
  await handleSetDelegate(event, "op");
}

export async function handleSetDelegate(
  event: SetDelegateLog,
  network: string
): Promise<void> {
  assert(event.args, "No logs in args");
  logger.warn(
    `Handling SetDelegateLog from ${network.toString()}; txhash: ${
      event.transactionHash
    }`
  );

  let delegator = event.args.delegator;
  let space = event.args.id;
  let delegate = event.args.delegate;
  let id = delegator
    .concat("-")
    .concat(space.toString())
    .concat("-")
    .concat(delegate);
  let delegation = Delegation.create({
    id: id,
    delegator: delegator,
    space: space,
    delegate: delegate,
    timestamp: BigInt(event.block.timestamp),
    network: network.toString(),
  });
  delegation.save();
}
