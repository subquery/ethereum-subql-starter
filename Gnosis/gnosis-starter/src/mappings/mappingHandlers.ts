import { TokenMint, Event, Address } from "../types";
import assert from "assert";
import { MintTokenTransaction } from "../types/abi-interfaces/PoapAbi";
import { BigNumber, BigNumberish } from "ethers";

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

  const [eventId, tokenID, receiverId, expirationTime, signature] = tx.args;
  const event = await checkGetEvent(await eventId);
  const receiver = await checkGetAddress(await receiverId);

  const tokenMint = TokenMint.create({
    id: tx.hash,
    blockHeight: BigInt(tx.blockNumber),
    date: new Date(Number(tx.blockTimestamp)),
    eventId: event.id,
    tokenID: BigNumber.from(await tokenID).toBigInt(),
    receiverId: receiver.id,
    expiration: new Date(Number(await expirationTime)),
  });

  await tokenMint.save();
}
