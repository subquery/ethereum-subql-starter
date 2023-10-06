import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "avalanche-subql-starter",
  description:
    "The goal of this quick start guide is to index all Pangolin token Approve logs",
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
     *  chainId is the EVM Chain ID, for Avalanche-C this is 43113
     *  https://chainlist.org/chain/43113
     */
    chainId: "43114",
    /**
     * This endpoint must be a public non-pruned archive node
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * You can get them from OnFinality for free https://app.onfinality.io
     * https://documentation.onfinality.io/support/the-enhanced-api-service
     */
    endpoint: ["https://avalanche.api.onfinality.io/public/ext/bc/C/rpc"],
    dictionary: "https://dict-tyk.subquery.network/query/avalanche",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      // # Block when the first reward is made
      startBlock: 7906490,
      options: {
        // Must be a key of assets
        abi: "erc20",
        // Pangolin reward contract https://snowtrace.io/token/0x88afdae1a9f58da3e68584421937e5f564a0135b
        address: "0x88afdae1a9f58da3e68584421937e5f564a0135b",
      },
      assets: new Map([["erc20", { file: "./abis/PangolinRewards.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleLog",
            filter: {
              topics: ["RewardPaid(address user, uint256 reward)"],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/jamesbayly/pangolin-rewards-tutorial",
};

export default project;
