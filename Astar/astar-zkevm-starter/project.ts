import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "astar-zkevm-starter",
  description:
    "This project can be use as a starting point for developing your new Astar zkEVM SubQuery project",
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
     * chainId is the EVM Chain ID, for Astar zkEVM this is 3776
     * https://chainlist.org/chain/3776
     */
    chainId: "3776",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://rpc.startale.com/astar-zkevm"],
    // Recommended to provide the HTTP endpoint of a full chain dictionary to speed up processing
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 101596, // This is the block that the contract was deployed on https://astar-zkevm.explorer.startale.com/tx/0x7035568194509ffe6e7d4707ce34bf7523a98a7b7f8a580ea7321d9849f995c9
      options: {
        // Must be a key of assets
        abi: "erc20",
        // This is the contract address for USDC Token https://astar-zkevm.explorer.startale.com/address/0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035
        address: "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035",
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
