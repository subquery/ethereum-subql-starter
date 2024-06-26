import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "polygon-lens",
  description:
    "This SubQuery project indexes Profile Creation, Post, Follow events for the Lens Protocol on Polygon Network",
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
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://polygon.rpc.subquery.network/public"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 28384641, // This is the block that the contract was deployed on
      options: {
        // Must be a key of assets
        abi: "LensHub",
        address: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
      },
      assets: new Map([["LensHub", { file: "./abis/LensHub.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handlePostCreated",
            filter: {
              topics: [
                "PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleProfileCreated",
            filter: {
              topics: [
                "ProfileCreated(uint256,address,address,string,string,address,bytes,string,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFollowed",
            filter: {
              topics: ["Followed(address,uint256[],bytes[],uint256)"],
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
