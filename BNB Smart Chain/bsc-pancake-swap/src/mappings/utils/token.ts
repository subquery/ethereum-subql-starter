// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StaticTokenDefinition } from "./staticTokenDefinition";
import { isNullEthValue } from ".";
import { BigNumber } from "@ethersproject/bignumber";
import { ERC20SymbolBytes__factory } from "../../types/contracts/factories/ERC20SymbolBytes__factory";
import { ERC20__factory } from "../../types/contracts/factories/ERC20__factory";
import { ERC20NameBytes__factory } from "../../types/contracts/factories/ERC20NameBytes__factory";
import assert from "assert";

export async function fetchTokenSymbol(tokenAddress: string): Promise<string> {
  const contract = ERC20__factory.connect(tokenAddress, api);
  const contractSymbolBytes = ERC20SymbolBytes__factory.connect(
    tokenAddress,
    api
  );
  // try types string and bytes32 for symbol
  let symbolValue = "unknown";
  try {
    symbolValue = await contract.symbol();
  } catch (e) {
    // try {
    const symbolResultBytes = await contractSymbolBytes.callStatic.symbol();
    if (!isNullEthValue(symbolResultBytes)) {
      symbolValue = symbolResultBytes.toString();
      // TODO: hexString -> utf8 string
      // throw new Error('Not implemented')
    } else {
      // try with the static definition
      const staticTokenDefinition =
        StaticTokenDefinition.fromAddress(tokenAddress);
      if (staticTokenDefinition) {
        symbolValue = staticTokenDefinition.symbol;
        logger.error("try with static definition");
      }
    }
  }
  return symbolValue;
}

export async function fetchTokenName(tokenAddress: string): Promise<string> {
  const contract = ERC20__factory.connect(tokenAddress, api);
  const contractNameBytes = ERC20NameBytes__factory.connect(tokenAddress, api);

  // try types string and bytes32 for name
  let nameValue = "unknown";
  try {
    nameValue = await contract.name();
  } catch (e) {
    const nameResultBytes = await contractNameBytes.name();
    if (!isNullEthValue(nameResultBytes)) {
      nameValue = nameResultBytes;
    } else {
      // try with the static definition
      const staticTokenDefinition =
        StaticTokenDefinition.fromAddress(tokenAddress);
      assert(staticTokenDefinition);
      if (staticTokenDefinition !== undefined) {
        nameValue = staticTokenDefinition.name;
      }
    }
  }
  return nameValue;
}

export async function fetchTokenTotalSupply(
  tokenAddress: string
): Promise<BigNumber> {
  const contract = ERC20__factory.connect(tokenAddress, api);
  let totalSupplyValue = null;
  try {
    totalSupplyValue = await contract.totalSupply();
  } catch (e) {
    return BigNumber.from(null);
  }
  return BigNumber.from(totalSupplyValue);
}

export async function fetchTokenDecimals(
  tokenAddress: string
): Promise<BigNumber | null> {
  // try types uint8 for decimals
  let decimalValue = null;
  try {
    const contract = ERC20__factory.connect(tokenAddress, api);
    decimalValue = await contract.decimals();
  } catch (e) {
    // try with the static definition
    const staticTokenDefinition =
      StaticTokenDefinition.fromAddress(tokenAddress);
    if (staticTokenDefinition != null) {
      return staticTokenDefinition.decimals;
    } else {
      logger.warn(`Could not get token ${tokenAddress} decimals`);
    }
  }
  return BigNumber.from(decimalValue);
}
