global.atob = require("atob");
global.Blob = require('node-blob');
import assert from "assert";
import { DripTransaction } from "../types/abi-interfaces/FaucetAbi";
import { Drip, DailyUSDCDrips } from "../types";
import { BigNumber } from "ethers";

export async function handleDrip(tx: DripTransaction): Promise<void> {
  //We add a logger to see the output of the script in the console.
  logger.info(`New Drip transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");
  const drip = Drip.create({
    id: tx.hash,
    blockHeight: tx.blockNumber.toString(),
    to: await tx.args[2], //Third argument of the method call. Index starts at 0.
    value: BigNumber.from(await tx.args[1]).toBigInt(), //Second argument of the method call. Index starts at 0.
    tokenAddress: await tx.args[0], //First argument of the method call. Index starts at 0.
    date: new Date(Number(tx.blockTimestamp) * 1000),
  });

  await drip.save();

  //We only want to aggregate the USDC drips
  if (drip.tokenAddress == "0x7b4Adf64B0d60fF97D672E473420203D52562A84") {
    await handleDailyDrips(drip.date, drip.value);
  }
}

export async function handleDailyDrips(date: Date, dripValue: bigint): Promise<void> {
  const id = date.toISOString().slice(0, 10);
  let aggregateDrips = await DailyUSDCDrips.get(id);

  if (!aggregateDrips) {
    aggregateDrips = DailyUSDCDrips.create({
      id,
      totalValue: dripValue,
    });
  }
  else {
    aggregateDrips.totalValue += dripValue;
  }


  await aggregateDrips.save();
}
