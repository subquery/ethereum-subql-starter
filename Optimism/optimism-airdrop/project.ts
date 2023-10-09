import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "optimism-airdrop",
  description:
    "This project can be use as a starting point for developing your new Optimism SubQuery project. It indexes all claim events from the Optimism airdrop",
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
     * chainId is the EVM Chain ID, for optimism this is 10
     * https://chainlist.org/chain/10
     */
    chainId: "10",
    /**
     * These endpoint(s) should be non-pruned archive nodes
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     # We suggest providing an array of endpoints for increased speed and reliability
     */
    endpoint: [
      "https://optimism.api.onfinality.io/public",
      "https://mainnet.optimism.io",
      "https://endpoints.omniatech.io/v1/op/mainnet/public",
      "https://opt-mainnet.g.alchemy.com/v2/demo",
      "https://rpc.ankr.com/optimism",
    ],
    // Recommended to provide the HTTP endpoint of a full chain dictionary to speed up processing
    dictionary: "https://dict-tyk.subquery.network/query/optimism-mainnet",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 100316590, // When the airdrop contract was deployed https://optimistic.etherscan.io/tx/0xdd10f016092f1584912a23e544a29a638610bdd6cb42a3e8b13030fd78334eba
      options: {
        // Must be a key of assets
        abi: "airdrop",
        // this is the contract address for Optimism Airdrop https://optimistic.etherscan.io/address/0xfedfaf1a10335448b7fa0268f56d2b44dbd357de
        address: "0xFeDFAF1A10335448b7FA0268F56D2B44DBD357de",
      },
      assets: new Map([["airdrop", { file: "./abis/airdrop.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleClaim",
            filter: {
              topics: [
                "Claimed(uint256 index, address account, uint256 amount)",
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
