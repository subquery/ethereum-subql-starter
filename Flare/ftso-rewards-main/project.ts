import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "flare-ftso-rewards",
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
     * chainId is the EVM Chain ID, for Flare Songbird this is 19
     * https://chainlist.org/chain/19
     */
    chainId: "19",
    /**
     * This endpoint must be a public non-pruned archive node
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * You can get them from OnFinality for free https://app.onfinality.io
     * https://documentation.onfinality.io/support/the-enhanced-api-service
     */
    endpoint: ["https://songbird-api.flare.network/ext/C/rpc"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 36036, //This is the block that the contract was deployed on https://songbird-explorer.flare.network/tx/0xe84e8a5e13017755185adaf9699b8b42782315243b826a2fa92f27516a4397cf
      options: {
        // Must be a key of assets
        abi: "ftsoRewardManager",
        address: "0xc5738334b972745067ffa666040fdeadc66cb925", // https://songbird-explorer.flare.network/address/0xc5738334b972745067fFa666040fdeADc66Cb925
      },
      assets: new Map([
        ["ftsoRewardManager", { file: "./ftsoRewardManager.abi.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleLog",
            filter: {
              /**
               * Follows standard log filters https://docs.ethers.io/v5/concepts/events/
               * address: "0x60781C2586D68229fde47564546784ab3fACA982"
               */
              topics: [
                "RewardClaimed(address indexed dataProvider, address indexed whoClaimed, address indexed sentTo, uint256 rewardEpoch, uint256 amount)",
              ],
            },
          },
        ],
      },
    },
  ],
};

export default project;
