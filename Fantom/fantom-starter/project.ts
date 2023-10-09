import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "fantom-starter",
  description:
    "This project can be use as a starting point for developing your new Fantom Opera SubQuery project",
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
     * chainId is the EVM Chain ID, for Fantom Opera this is 250
     * https://chainlist.org/chain/250
     */
    chainId: "250",
    /**
     * These endpoint(s) should be non-pruned archive nodes
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     # We suggest providing an array of endpoints for increased speed and reliability
     */
    endpoint: [
      "https://rpcapi.fantom.network",
      "https://fantom.publicnode.com",
    ],
    dictionary: "https://dict-tyk.subquery.network/query/fantom",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      //This is the block that the contract was deployed on https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83
      startBlock: 67295175,
      options: {
        // Must be a key of assets
        abi: "erc20",
        // This is the contract address for Wrapped FTM https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83
        address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
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

export default project;
