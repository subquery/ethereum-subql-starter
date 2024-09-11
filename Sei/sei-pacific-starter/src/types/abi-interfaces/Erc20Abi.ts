// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {EthereumLog, EthereumTransaction, LightEthereumLog} from "@subql/types-ethereum";

import {ApprovalEvent, TransferEvent, Erc20Abi} from '../contracts/Erc20Abi'


export type ApprovalLog = EthereumLog<ApprovalEvent["args"]>

export type TransferLog = EthereumLog<TransferEvent["args"]>


export type LightApprovalLog = LightEthereumLog<ApprovalEvent["args"]>

export type LightTransferLog = LightEthereumLog<TransferEvent["args"]>


export type NameTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['name']>>

export type ApproveTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['approve']>>

export type TotalSupplyTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['totalSupply']>>

export type TransferFromTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['transferFrom']>>

export type DecimalsTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['decimals']>>

export type BalanceOfTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['balanceOf']>>

export type SymbolTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['symbol']>>

export type TransferTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['transfer']>>

export type AllowanceTransaction = EthereumTransaction<Parameters<Erc20Abi['functions']['allowance']>>

