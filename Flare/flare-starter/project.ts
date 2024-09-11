import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "flare-starter",
  description:
    "This project can be use as a starting point for developing your new Flare SubQuery project",
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
     * chainId is the EVM Chain ID, for Flare this is 14
     * https://chainlist.org/chain/14
     */
    chainId: "14",
    /**
     * This endpoint must be a public non-pruned archive node
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * You can get them from OnFinality for free https://app.onfinality.io
     * https://documentation.onfinality.io/support/the-enhanced-api-service
     */
    endpoint: ["https://flare-api.flare.network/ext/C/rpc"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 2300000, //This is the block that the contract was deployed on https://explorer.celo.org/mainnet/token/0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207
      options: {
        // Must be a key of assets
        abi: "priceSubmitter",
        address: "0x1000000000000000000000000000000000000003",
      },
      assets: new Map([
        ["priceSubmitter", { file: "./priceSubmitter.abi.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Call, // We use ethereum handlers since Celo is EVM-compatible
            handler: "handleTransaction",
            filter: {
              /**
               * The function can either be the function fragment or signature
               * function: '0x095ea7b3'
               * function: '0x7ff36ab500000000000000000000000000000000000000000000000000000000'
               */
              function: "submitHash(uint256 _epochId, bytes32 _hash)",
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
                "HashSubmitted(address indexed submitter, uint256 indexed epochId, bytes32 hash, uint256 timestamp)",
              ],
            },
          },
        ],
      },
    },
  ],
};

export default project;
