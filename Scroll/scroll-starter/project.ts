import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "scroll-starter",
  description:
    "This project can be use as a starting point for developing your new Scroll Mainnet SubQuery project",
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
     * chainId is the EVM Chain ID, for Scroll this is 534352
     * https://chainlist.org/chain/534352
     */
    chainId: "534352",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: [
      "https://rpc.scroll.io",
      "https://1rpc.io/scroll",
      "https://scroll.blockpi.network/v1/rpc/public",
      "https://rpc.ankr.com/scroll",
      "https://rpc-scroll.icecreamswap.com",
      "https://scroll-mainnet.chainstacklabs.com",
    ],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 37, // This is the block that the contract was deployed on https://scrollscan.com/tx/0x7d9d49c6ffb59bb53cf18f3843ce2d26bd835d4ccf3ccc9489fc67501ee298e8

      options: {
        // Must be a key of assets
        abi: "erc20",
        // This is the contract address for USDC https://scrollscan.com/token/0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4
        address: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
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
