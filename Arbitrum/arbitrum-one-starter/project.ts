import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "arbitrum-one-subql-starter",
  description:
    "This project can be use as a starting point for developing your new Arbitrum One SubQuery project",
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
     * chainId is the EVM Chain ID, for Arbitrum One this is 42161
     * https://chainlist.org/chain/42161
     */
    chainId: "42161",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     */
    endpoint: ["https://arbitrum.api.onfinality.io/public"],
    dictionary: "https://dict-tyk.subquery.network/query/arbitrum",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      // This is the block that the contract was deployed on https://arbiscan.io/tx/0x8ebe1945f039f865af8b3079df3819534340ee41a5e6b8bfefb9c36a857778c9
      startBlock: 2591,
      options: {
        // Must be a key of assets
        abi: "erc20",
        // This is the contract address for wrapped BTC https://arbiscan.io/token/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f
        address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
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
               * address: "0x60781C2586D68229fde47564546784ab3fACA982"
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
