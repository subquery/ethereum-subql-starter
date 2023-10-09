import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "uniswap-v3",
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
     * These endpoint(s) should be non-pruned archive nodes
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     # We suggest providing an array of endpoints for increased speed and reliability
     */
    endpoint: ["https://eth.api.onfinality.io/public"],
    dictionary: "https://gx.api.subquery.network/sq/subquery/eth-dictionary",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 12864088,

      options: {
        // Must be a key of assets
        abi: "FeedRegistry",
        address: "0x47fb2585d2c56fe188d0e6ec628a38b74fceeedf",
      },
      assets: new Map([
        ["FeedRegistry", { file: "./abis/FeedRegistry.json" }],
        [
          "AccessControlledOffchainAggregator",
          { file: "./abis/AccessControlledOffchainAggregator.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFeedConfirmed",
            filter: {
              topics: [
                "FeedConfirmed(address,address,address,address,uint16,address)",
              ],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
  templates: [
    {
      kind: EthereumDatasourceKind.Runtime,
      name: "DataFeed",
      options: {
        // Must be a key of assets
        abi: "AccessControlledOffchainAggregator",
      },
      assets: new Map([
        [
          "AccessControlledOffchainAggregator",
          { file: "./abis/AccessControlledOffchainAggregator.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleAnswerUpdated",
            filter: {
              topics: ["AnswerUpdated(int256,uint256,uint256)"],
            },
          },
        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
