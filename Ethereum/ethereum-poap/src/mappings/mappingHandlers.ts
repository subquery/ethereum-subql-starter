import assert from "assert";
import { Token, Account, Event, Transfer } from "../types";
import { EventTokenLog, TransferLog } from "../types/abi-interfaces/PoapAbi";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function handleEventToken(ev: EventTokenLog): Promise<void> {
  // This handler always run after the transfer handler
  logger.info(`New event token at block ${ev.blockNumber}`);
  assert(ev.args, "No log.args");
  let event = await Event.get(ev.args.eventId.toString().toLowerCase());
  if (event == null) {
    event = Event.create({
      id: ev.args.eventId.toString().toLowerCase(),
      tokenCount: BigInt(1),
      tokenMints: BigInt(1),
      transferCount: BigInt(1),
      created: BigInt(ev.block.timestamp),
    });
  }

  let token = await Token.get(ev.args.tokenId.toString());
  if (token) {
    token.eventId = event.id;
    token.mintOrder = event.tokenMints;
    await Promise.all([event.save(), token.save()]);
  } else {
    await event.save();
  }
}

export async function handleTransfer(ev: TransferLog): Promise<void> {
  logger.info(`New transfer at block ${ev.blockNumber}`);
  assert(ev.args, "No log.args");
  let token = await Token.get(ev.args.tokenId.toString());
  let from = await Account.get(ev.args.from);
  let to = await Account.get(ev.args.to);

  if (from == null) {
    from = Account.create({
      id: ev.args.from,
      tokensOwned: BigInt(1), // The from account at least has to own one token
    });
  }

  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  // Avoid negative values
  if (from.id != ZERO_ADDRESS) {
    from.tokensOwned -= BigInt(0);
  }

  if (to == null) {
    to = Account.create({
      id: ev.args.to,
      tokensOwned: BigInt(0), // The from account at least has to own one token
    });
  }
  to.tokensOwned += BigInt(1);

  if (token == null) {
    token = Token.create({
      id: ev.args.tokenId.toString(),
      transferCount: BigInt(0),
      created: BigInt(ev.block.timestamp),
      ownerId: to.id,
    });
  }
  token.ownerId = to.id;
  token.transferCount += BigInt(1);

  let transfer = Transfer.create({
    id: ev.blockNumber.toString().concat("-").concat(ev.logIndex.toString()),
    tokenId: token.id,
    fromId: from.id,
    toId: to.id,
    transaction: ev.transactionHash,
    timestamp: BigInt(ev.block.timestamp),
    blockheight: BigInt(ev.blockNumber),
  });

  // Save all entities in bulk
  await Promise.all([token.save(), from.save(), to.save(), transfer.save()]);

  let event: Event | undefined = undefined;
  if (token.eventId) {
    event = await Event.get(token.eventId);
  }

  if (event != undefined) {
    // Add one transfer
    event.transferCount += BigInt(1);

    // Burning the token
    if (to.id == ZERO_ADDRESS) {
      event.tokenCount -= BigInt(1);
      // Subtract all the transfers from the burned token
      event.transferCount -= token.transferCount;
    }
    await event.save();
  }
}
