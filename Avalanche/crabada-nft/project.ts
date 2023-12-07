import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "crabada-nft",
  description: "This project indexes all Crabada NFTs on Avalanche's C-chain",
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
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://avalanche.api.onfinality.io/public/ext/bc/C/rpc"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      // First mint https://snowtrace.io/tx/0x17336f3699f922c245663a50fba2d857c368f6c8137024b980cc2e7042e4df87
      startBlock: 30128346,
      options: {
        // Must be a key of assets
        abi: "crabada",
        // Crabada Legacy Contract https://snowtrace.io/address/0xCB7569a6Fe3843c32512d4F3AB35eAE65bd1D50c
        address: "0xCB7569a6Fe3843c32512d4F3AB35eAE65bd1D50c",
      },
      assets: new Map([["erc20", { file: "./abis/crabada.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleERC721",
            filter: {
              topics: ["Transfer(address from, address to, uint256 tokenId)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleNewCrab",
            filter: {
              topics: [
                "NewCrab(address account, uint256 id, uint256 daddyId, uint256 mommyId, uint256 dna, uint64 birthday, uint8 breedingCount)\n",
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
