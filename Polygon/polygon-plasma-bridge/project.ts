import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "polygon-plasma-bridge",
  description:
    "This example project indexes all token deposits from the Polygon Plamsa Bridge",
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
     * chainId is the EVM Chain ID, for Polygon this is 137
     * https://chainlist.org/chain/137
     */
    chainId: "137",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     */
    endpoint: "https://polygon.api.onfinality.io/public",
    // Recommended to provide the HTTP endpoint of a full chain dictionary to speed up processing
    dictionary:
      "https://gx.api.subquery.network/sq/subquery/polygon-dictionary",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 8323392,
      options: {
        // Must be a key of assets
        abi: "plasma",
        // Plasma contract
        address: "0xd9c7c4ed4b66858301d0cb28cc88bf655fe34861",
      },
      assets: new Map([["plasma", { file: "./abis/plasma.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDeposit",
            filter: {
              topics: [
                "TokenDeposited (address indexed rootToken, address indexed childToken, address indexed user, uint256 amount, uint256 depositCount)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDeposit",
            filter: {
              topics: [
                "TokenWithdrawn (address indexed rootToken, address indexed childToken, address indexed user, uint256 amount, uint256 withrawCount)",
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
