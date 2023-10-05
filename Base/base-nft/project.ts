import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "subquery-example-base-nft",
    description: "This project can be use as a starting point for developing your new Base SubQuery project",
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
         *  chainId is the EVM Chain ID, for Base Mainnet this is 8453
         *  https://chainlist.org/chain/8453
         */
        chainId:
            "8453",
        /**
         * This endpoint must be a public non-pruned archive node
         * Public nodes may be rate limited, which can affect indexing speed
         * When developing your project we suggest getting a private API key
         * You can get them from OnFinality for free https://app.onfinality.io
         * https://documentation.onfinality.io/support/the-enhanced-api-service
         */
        endpoint: ["https://mainnet.base.org/", "https://rpc.notadegen.com/base"],
    },
    dataSources: [
        {
            kind: EthereumDatasourceKind.Runtime,
            startBlock: 2155076,

            options: {
                // Must be a key of assets
                abi:'erc721base',
                // This is the contract address for Bridge To Base NFT Collection 0xea2a41c02fa86a4901826615f9796e603c6a4491
                address:'0xea2a41c02fa86a4901826615f9796e603c6a4491'
            },
            assets: new Map([
                ['erc721base', { file: "./abis/erc721base.abi.json" }],
            ]),
            mapping: {
                file: "./dist/index.js",
                handlers: [
                    {
                        kind: EthereumHandlerKind.Event,
                        handler: "handleNftClaim",
                        filter: {
                            /**
                             * Follows standard log filters https://docs.ethers.io/v5/concepts/events/
                             */
                            topics: [" TokensClaimed (uint256 claimConditionIndex, address claimer, address receiver, uint256 startTokenId, uint256 quantityClaimed)\n"],
                        },
                    },
                ],
            },
        },
    ],
    repository: "https://github.com/subquery/ethereum-subql-starter"
};

export default project;
