import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "manta-pacific-starter",
  description:
    "This project can be use as a starting point for developing your new Manta Pacific SubQuery project",
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
     * chainId is the EVM Chain ID, for Manta Pacific this is 169
     * https://chainlist.org/chain/169
     */
    chainId: "169",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: [
      "https://pacific-rpc.manta.network/http",
      "https://1rpc.io/manta",
    ],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 42964,
      // Usually you would set this to the block that the contract was deployed on https://manta.socialscan.io/tx/0xa7f4451381035ffa686cd981b471e95b1255e1f3ca9aedc0c434232aec38ab96
      // However on this RPC, they prune all logs older than the most recent 10000 blocks
      // When running, either use an archival node that has no pruning, or update this value to be within the last 10000 blocks
      options: {
        // Must be a key of assets
        abi: "erc20",
        // this is the contract address for USDC https://manta.socialscan.io/token/0xb73603c5d87fa094b7314c74ace2e64d165016fb
        address: "0xb73603c5d87fa094b7314c74ace2e64d165016fb",
      },
      assets: new Map([["erc20", { file: "./abis/erc20.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Call,
            handler: "handleTransaction",
            filter: {
              /**
               * The function can either be the function fragment or signature
               * function: '0x095ea7b3'
               * function: '0x7ff36ab500000000000000000000000000000000000000000000000000000000'
               */
              function: "approve(address spender, uint256 rawAmount)",
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleLog",
            filter: {
              /**
               * Follows standard log filters https://docs.ethers.io/v5/concepts/events/
               * address: "0xb73603c5d87fa094b7314c74ace2e64d165016fb"
               */
              topics: [
                "Transfer(address indexed from, address indexed to, uint256 amount)",
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
