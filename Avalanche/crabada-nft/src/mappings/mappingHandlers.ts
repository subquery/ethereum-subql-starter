import assert from "assert";
import { Crab, Transfer, Address } from "../types";
import { NewCrabLog, TransferLog } from "../types/abi-interfaces/Crabada";
import { Crabada__factory } from "../types/contracts/factories/Crabada__factory";

async function checkCreateAddress(id: string): Promise<Address> {
  let address = await Address.get(id.toLowerCase());
  if (!address) {
    address = Address.create({
      id: id.toLowerCase(),
    });
    await address.save();
  }
  return address;
}

export async function handleNewCrab(newCrabLog: NewCrabLog): Promise<void> {
  logger.info(
    "encountered New Crab Log on block " + newCrabLog.blockNumber.toString(),
  );
  // Process remainder
  assert(newCrabLog.args, "Requires args");
  const erc721Instance = Crabada__factory.connect(newCrabLog.address, api);
  const account = await checkCreateAddress(newCrabLog.args.account);
  const daddy = await Crab.get(newCrabLog.args.daddyId.toString());
  const mommy = await Crab.get(newCrabLog.args.mommyId.toString());
  const minterAddress = await checkCreateAddress(newCrabLog.transaction.from);

  let metadataUri;
  try {
    // metadata possibly undefined
    // nft can share same metadata
    // if collection.name and symbol exist, meaning there is metadata on this contract
    metadataUri = await erc721Instance.tokenURI(newCrabLog.args.id);
  } catch (e) {}

  let crab = await Crab.get(newCrabLog.args.id.toString());
  // Reset crab with new data
  crab = Crab.create({
    id: newCrabLog.args.id.toString(),
    addressId: account.id,
    daddyId: daddy?.id,
    mommyId: mommy?.id,
    dna: newCrabLog.args.dna.toBigInt(),
    birthday: newCrabLog.args.birthday.toBigInt(),
    breeding_count: newCrabLog.args.breedingCount,
    minted_block: BigInt(newCrabLog.blockNumber),
    minted_timestamp: newCrabLog.block.timestamp,
    minter_addressId: minterAddress.id,
    current_ownerId: account.id,
    metadata_url: metadataUri,
  });

  await crab.save();
}

export async function handleERC721(transferLog: TransferLog): Promise<void> {
  logger.info(
    "encountered crabada transfer on block " +
      transferLog.blockNumber.toString(),
  );

  assert(transferLog.args, "No event args on erc721");

  const nftId = transferLog.args.tokenId.toString();
  const fromAddress = await checkCreateAddress(transferLog.args.from);
  const toAddress = await checkCreateAddress(transferLog.args.to);

  let crab = await Crab.get(nftId);
  if (crab) {
    logger.info(`We have seen crab ${nftId} before`);
  } else {
    logger.info(`We have not seen crab ${nftId} before`);
    const account = await checkCreateAddress(transferLog.address.toLowerCase());
    const minterAddress = await checkCreateAddress(
      transferLog.transaction.from,
    );
    // We create a minimal version so we can proceed
    crab = Crab.create({
      id: nftId,
      addressId: account.id,
      minted_block: BigInt(transferLog.blockNumber),
      minted_timestamp: transferLog.block.timestamp,
      minter_addressId: minterAddress.id,
      current_ownerId: toAddress.id,
    });
    await crab.save();
  }

  // Create the transfer record
  const transfer = Transfer.create({
    id: `${transferLog.transactionHash}-${transferLog.logIndex.toString()}`,
    tokenId: transferLog.args.tokenId.toString(),
    block: BigInt(transferLog.blockNumber),
    timestamp: transferLog.block.timestamp,
    transaction_hash: transferLog.transactionHash,
    crabId: crab.id,
    fromId: fromAddress.id,
    toId: toAddress.id,
  });

  await transfer.save();
}
