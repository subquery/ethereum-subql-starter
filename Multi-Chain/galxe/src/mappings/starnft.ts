import { NFT, NFTMintTransaction } from "../types";
import { ADDRESS_ZERO } from "./helper";
import { TransferLog } from "../types/abi-interfaces/StarNFT";

export async function handleTransfer(
  event: TransferLog,
  network: string
): Promise<void> {
  logger.info("Handling TransferLog");
  logger.info(event.transactionHash);
  let nft_contract = event.address;
  logger.info(nft_contract);
  // assert(event.args, "No args in log");
  let from = event.topics[0];
  logger.info(`from = ${from}`);
  let to = event.topics[1];
  logger.info(`to = ${to}`);
  let nft_id = event.topics[2];
  logger.info(`nft_id = ${nft_id}`);

  logger.info(
    `NFT ${nft_contract} ${nft_id.toString()} transfer from ${from} to ${to}`
  );

  if (from == ADDRESS_ZERO) {
    // Wheather is Claim or ClaimBatch, this tx only contains one nft contract mint event
    let tx = await NFTMintTransaction.get(event.transaction.hash);
    if (!tx) {
      tx = NFTMintTransaction.create({
        id: event.transaction.hash,
        nftContract: nft_contract,
        nftID: BigInt(nft_id),
        from: from,
        to: to,
        block: BigInt(event.block.number),
        network: network,
      });
      tx.save();
    }
    return;
  }
  // nft
  let nft_model_id = nft_contract.concat("-").concat(nft_id.toString());
  let nft = await NFT.get(nft_model_id);
  if (!nft) {
    logger.info(`NFT Not Found ${nft_contract} ${nft_id.toString()}`);
    return;
  }
  nft.owner = to;
  nft.save();
}

export async function handleTransferEthereum(
  event: TransferLog
): Promise<void> {
  logger.info("Handling handleTransferEthereum");
  await handleTransfer(event, "ethereum");
}

export async function handleTransferArbitrum(
  event: TransferLog
): Promise<void> {
  logger.info("Handling handleTransferArbitrum");
  await handleTransfer(event, "arbitrum");
}

export async function handleTransferPolygon(event: TransferLog): Promise<void> {
  logger.info("Handling handleTransferPolygon");
  await handleTransfer(event, "polygon");
}
