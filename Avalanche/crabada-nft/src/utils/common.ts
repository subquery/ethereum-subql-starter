export function getCollectionId(networkId: string, address: string): string {
  return `${networkId}-${address}`;
}

export function getTransferId(
  networkId: string,
  transactionHash: string,
  logIndex: string,
  batchIndex: number
): string {
  return `${transactionHash}-${logIndex}-${batchIndex}-${networkId}`;
}

export function extractIpfsHash(metadataUri: string): string {
  const hashStartIndex = "ipfs://".length;
  return metadataUri.slice(hashStartIndex);
}

export function incrementBigInt(value: bigint): bigint {
  return BigInt(1) + value;
}
