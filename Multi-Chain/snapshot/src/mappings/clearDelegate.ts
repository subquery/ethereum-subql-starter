import { ClearDelegateLog } from "../types/abi-interfaces/DelegateRegistry";
import assert from "assert";

export async function handleEthereumClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "ethereum");
}

export async function handleBSCClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "bsc");
}

export async function handleArbitrumClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "arbitrum");
}

export async function handleFantomClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "fantom");
}

export async function handleGnosisClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "gnosis");
}

export async function handleGoerliClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "goerli");
}

export async function handleMaticClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "matic");
}

export async function handleOPClearDelegateEvent(
  event: ClearDelegateLog,
): Promise<void> {
  await handleClearDelegate(event, "op");
}

export async function handleClearDelegate(
  event: ClearDelegateLog,
  network: string,
): Promise<void> {
  assert(event.args, "No logs in args");
  logger.warn(
    `Handling ClearDelegateLog from ${network.toString()}; txhash: ${
      event.transactionHash
    }`,
  );
  let delegator = event.args.delegator;
  let space = event.args.id;
  let delegate = event.args.delegate;
  let id = delegator
    .concat("-")
    .concat(space.toString())
    .concat("-")
    .concat(delegate);
  store.remove("Delegation", id);
}
