// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {EthereumLog, EthereumTransaction} from "@subql/types-ethereum";

import {

  ApprovalEvent,

  DelegateChangedEvent,

  DelegateVotesChangedEvent,

  TransferEvent,

  PangolinERC20
} from '../contracts/PangolinERC20'


  export type ApprovalLog = EthereumLog<ApprovalEvent["args"]>

  export type DelegateChangedLog = EthereumLog<DelegateChangedEvent["args"]>

  export type DelegateVotesChangedLog = EthereumLog<DelegateVotesChangedEvent["args"]>

  export type TransferLog = EthereumLog<TransferEvent["args"]>


  export type DELEGATION_TYPEHASHTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['DELEGATION_TYPEHASH']>>

  export type DOMAIN_TYPEHASHTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['DOMAIN_TYPEHASH']>>

  export type PERMIT_TYPEHASHTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['PERMIT_TYPEHASH']>>

  export type AllowanceTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['allowance']>>

  export type ApproveTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['approve']>>

  export type BalanceOfTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['balanceOf']>>

  export type CheckpointsTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['checkpoints']>>

  export type DecimalsTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['decimals']>>

  export type DelegateTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['delegate']>>

  export type DelegateBySigTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['delegateBySig']>>

  export type DelegatesTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['delegates']>>

  export type GetCurrentVotesTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['getCurrentVotes']>>

  export type GetPriorVotesTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['getPriorVotes']>>

  export type NameTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['name']>>

  export type NoncesTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['nonces']>>

  export type NumCheckpointsTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['numCheckpoints']>>

  export type PermitTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['permit']>>

  export type SymbolTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['symbol']>>

  export type TotalSupplyTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['totalSupply']>>

  export type TransferTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['transfer']>>

  export type TransferFromTransaction = EthereumTransaction<Parameters<PangolinERC20['functions']['transferFrom']>>



