import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "iotex-testnet-sandbox-starter",
  description:
    "This project can be use as a starting point for developing your new Iotex Testnet Sandbox project",
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
     * chainId is the EVM Chain ID, for Iotex Testnet this is 4690
     * https://chainlist.org/chain/4690
     */
    chainId: "4690",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://babel-api.testnet.iotex.io"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 24398570,
      options: {
        abi: "ProjectRegistrar",
        address: "0x02feBE78F3A740b3e9a1CaFAA1b23a2ac0793D26",
      },
      assets: new Map([
        ["ProjectRegistrar", { file: "./abis/ProjectRegistrar.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleProjectUpsert",
            filter: {
              topics: [
                "ProjectUpserted(indexed uint64,string,bytes32)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleProjectPause",
            filter: {
              topics: [
                "ProjectPaused(indexed uint64)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleProjectUnpause",
            filter: {
              topics: [
                "ProjectUnpaused(indexed uint64)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleProjectTransfer",
            filter: {
              topics: [
                "Transfer(indexed address,indexed address,indexed uint256)",
              ],
            },
          },
        ],
      },
    },
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 24792800,
      options: {
        abi: "NodeRegistry",
        address: "0x16ca331641a9537e346e12C7403fDA014Da72F16",
      },
      assets: new Map([
        ["NodeRegistry", { file: "./abis/NodeRegistry.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNodeRegister",
            filter: {
              topics: [
                "NodeRegistered(indexed address,indexed uint256,indexed address)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNodeUpdate",
            filter: {
              topics: [
                "NodeUpdated(indexed uint256,indexed address)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNodeTransfer",
            filter: {
              topics: [
                "Transfer(indexed address,indexed address,indexed uint256)",
              ],
            },
          },
        ],
      },
    },
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 24792800,
      options: {
        abi: "ProjectRegistrar",
        address: "0x8D3c113805f970839940546D5ef88afE98Ba76E4",
      },
      assets: new Map([
        ["FleetManager", { file: "./abis/FleetManager.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNodeAllow",
            filter: {
              topics: [
                "NodeAllowed(indexed uint256,indexed uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNodeDisallow",
            filter: {
              topics: [
                "NodeDisallowed(indexed uint256,indexed uint256)",
              ],
            },
          },
        ],
      },
    },
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 24792800,
      options: {
        abi: "W3bstreamRouter",
        address: "0x1BFf17c79b5fa910cC77e95Ca82C7De26fC3C3b0",
      },
      assets: new Map([
        ["W3bstreamRouter", { file: "./abis/W3bstreamRouter.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleReceiverRegister",
            filter: {
              topics: [
                "ReceiverRegistered(indexed uint256,indexed address)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleReceiverUnregister",
            filter: {
              topics: [
                "ReceiverUnregistered(indexed uint256,indexed address)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDataReceive",
            filter: {
              topics: [
                "DataReceived(indexed address,bool,string)",
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
