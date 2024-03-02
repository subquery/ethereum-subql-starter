import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "subquery-example-ens",
  description:
    "This project can be use as a starting point for developing your new Ethereum SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Ethereum this is 1
     * https://chainlist.org/chain/1
     */
    chainId: "1",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://eth.api.onfinality.io/public"],
  },
  dataSources: [
    // ENSRegistry
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 9380380,

      options: {
        // Must be a key of assets
        abi: "EnsRegistry",
        address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
      },
      assets: new Map([["EnsRegistry", { file: "./abis/Registry.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransfer",
            filter: {
              topics: ["Transfer(bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewOwner",
            filter: {
              topics: ["NewOwner(bytes32,bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewResolver",
            filter: {
              topics: ["NewResolver(bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewTTL",
            filter: {
              topics: ["NewTTL(bytes32,uint64)"],
            },
          },
        ],
      },
    },
    // ENSRegistryOld
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 3327417,

      options: {
        // Must be a key of assets
        abi: "EnsRegistry",
        address: "0x314159265dd8dbb310642f98f50c066173c1259b",
      },
      assets: new Map([["EnsRegistry", { file: "./abis/Registry.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransferOldRegistry",
            filter: {
              topics: ["Transfer(bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewOwnerOldRegistry",
            filter: {
              topics: ["NewOwner(bytes32,bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewResolverOldRegistry",
            filter: {
              topics: ["NewResolver(bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewTTLOldRegistry",
            filter: {
              topics: ["NewTTL(bytes32,uint64)"],
            },
          },
        ],
      },
    },
    // Resolver
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 3327417,

      options: {
        // Must be a key of assets
        abi: "Resolver",
      },
      assets: new Map([["Resolver", { file: "./abis/PublicResolver.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleABIChanged",
            filter: {
              topics: ["ABIChanged(bytes32,uint256)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleAddrChanged",
            filter: {
              topics: ["AddrChanged(bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleMulticoinAddrChanged",
            filter: {
              topics: ["AddressChanged(bytes32,uint256,bytes)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleAuthorisationChanged",
            filter: {
              topics: ["AuthorisationChanged(bytes32,address,address,bool)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleContentHashChanged",
            filter: {
              topics: ["ContenthashChanged(bytes32,bytes)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInterfaceChanged",
            filter: {
              topics: ["InterfaceChanged(bytes32,bytes4,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameChanged",
            filter: {
              topics: ["NameChanged(bytes32,string)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handlePubkeyChanged",
            filter: {
              topics: ["PubkeyChanged(bytes32,bytes32,bytes32)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTextChanged",
            filter: {
              topics: ["TextChanged(bytes32,string,string)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTextChangedWithValue",
            filter: {
              topics: ["TextChanged(bytes32,string,string,string)"],
            },
          },
        ],
      },
    },
    // BaseRegistrar
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 9380410,

      options: {
        // Must be a key of assets
        abi: "BaseRegistrar",
        address: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
      },
      assets: new Map([
        ["BaseRegistrar", { file: "./abis/BaseRegistrar.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRegistered",
            filter: {
              topics: ["NameRegistered(uint256,address,uint256)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRenewed",
            filter: {
              topics: ["NameRenewed( uint256,uint256)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameTransferred",
            filter: {
              topics: ["Transfer(address,address,uint256)"],
            },
          },
        ],
      },
    },
    // EthRegistrarControllerOld
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 9380471,
      options: {
        // Must be a key of assets
        abi: "EthRegistrarControllerOld",
        address: "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5",
      },
      assets: new Map([
        [
          "EthRegistrarControllerOld",
          { file: "./abis/EthRegistrarControllerOld.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRegisteredByControllerOld",
            filter: {
              topics: [
                "NameRegistered(string, bytes32, address,uint256,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRenewedByController",
            filter: {
              topics: ["NameRenewed(string,bytes32,uint256,uint256)"],
            },
          },
        ],
      },
    },
    // EthRegistrarController
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 3327417,
      options: {
        // Must be a key of assets
        abi: "EthRegistrarController",
      },
      assets: new Map([
        [
          "EthRegistrarController",
          { file: "./abis/EthRegistrarController.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRegisteredByController",
            filter: {
              topics: [
                "NameRegistered(string, bytes32, address,uint256,uint256,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameRenewedByController",
            filter: {
              topics: ["NameRenewed(string, bytes32,uint256,uint256)"],
            },
          },
        ],
      },
    },
    // NameWrapper
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 3327417,
      options: {
        // Must be a key of assets
        abi: "NameWrapper",
      },
      assets: new Map([["NameWrapper", { file: "./abis/NameWrapper.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameWrapped",
            filter: {
              topics: ["NameWrapped( bytes32,bytes,address,uint32,uint64)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNameUnwrapped",
            filter: {
              topics: ["NameUnwrapped( bytes32,address)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFusesSet",
            filter: {
              topics: ["FusesSet( bytes32,uint32,uint64)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransferSingle",
            filter: {
              topics: [
                "TransferSingle( address, address, address,uint256,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransferBatch",
            filter: {
              topics: [
                "TransferBatch( address, address, address,uint256[],uint256[])",
              ],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;
