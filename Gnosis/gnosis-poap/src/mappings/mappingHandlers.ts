import { Token, Event, Address, TokenTransfer } from "../types";
import assert from "assert";
import {
  EventTokenLog,
  MintTokenTransaction,
  TransferLog,
} from "../types/abi-interfaces/PoapAbi";
import { BigNumberish } from "ethers";

async function checkGetEvent(id: BigNumberish): Promise<Event> {
  let event = await Event.get(id.toString().toLowerCase());
  if (!event) {
    event = Event.create({
      id: id.toString().toLowerCase(),
    });

    await event.save();
  }
  return event;
}

async function checkGetAddress(id: string): Promise<Event> {
  let address = await Address.get(id.toLowerCase());
  if (!address) {
    address = Address.create({
      id: id.toLowerCase(),
    });

    await address.save();
  }
  return address;
}

export async function handleTokenMint(tx: MintTokenTransaction): Promise<void> {
  logger.info(`New Token Mint transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  // logger.info(JSON.stringify(tx.args));
  const [eventId, receiverId] = tx.args;
  const event = await checkGetEvent(await eventId);
  const receiver = await checkGetAddress(await receiverId);

  // The tokenID is from the logs from this transaction
  // This searches by the function fragment signature to get the right log
  const eventTokenLog = tx.logs?.find((log) =>
    log.topics.includes(
      "0x4b3711cd7ece062b0828c1b6e08d814a72d4c003383a016c833cbb1b45956e34"
    )
  ) as EventTokenLog;

  if (eventTokenLog) {
    const tokenId = eventTokenLog.args?.tokenId;
    assert(tokenId, "No tokenID");

    const newToken = Token.create({
      id: tokenId.toString(),
      mintTx: tx.hash,
      mintBlockHeight: BigInt(tx.blockNumber),
      mintDate: new Date(Number(tx.blockTimestamp) * 1000), // Saved as a seconds epoch
      mintReceiverId: receiver.id,
      currentHolderId: receiver.id,
      eventId: event.id,
    });

    await newToken.save();
  }
}

export async function handleTokenTransfer(log: TransferLog) {
  logger.info(`New Token Transfer log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  // We ignore all transfers from 0x0000000000000000000000000000000000000000 since they are from the original mint
  if (log.args.from != "0x0000000000000000000000000000000000000000") {
    const from = await checkGetAddress(await log.args.from);
    const to = await checkGetAddress(await log.args.to);
    let token = await Token.get(await log.args.tokenId.toString());

    if (!token) {
      token = Token.create({
        id: log.args.tokenId.toString(),
        mintBlockHeight: BigInt(log.blockNumber),
        mintDate: new Date(Number(log.block.timestamp) * 1000), // Saved as a seconds epoch
        mintReceiverId: to.id,
        currentHolderId: to.id,
      });
    }

    const newTokenTransfer = TokenTransfer.create({
      id: log.transactionHash,
      txHash: log.transactionHash,
      date: new Date(Number(log.block.timestamp) * 1000), // Saved as a seconds epoch
      blockHeight: BigInt(log.blockNumber),
      fromId: from.id,
      toId: to.id,
      tokenId: token.id,
    });

    await newTokenTransfer.save();

    token.currentHolderId = to.id;
    await token.save();
  }
}
