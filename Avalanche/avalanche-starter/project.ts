import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "avalanche-starter",
  description:
    "This project can be use as a starting point for developing your new Avalanche C-Chain SubQuery project",
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
      // Contract creation of Pangolin Token https://snowtrace.io/tx/0xfab84552e997848a43f05e440998617d641788d355e3195b6882e9006996d8f9
      startBlock: 57360,
      options: {
        // Must be a key of assets
        abi: "erc20",
        // This is the contract address for Wrapped Ether https://testnet.snowtrace.io/token/0x60781C2586D68229fde47564546784ab3fACA982
        address: "0x60781C2586D68229fde47564546784ab3fACA982",
      },
      assets: new Map([["erc20", { file: "./abis/PangolinERC20.json" }]]),
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
              function: "approve(address spender, uint256 amount)",
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
