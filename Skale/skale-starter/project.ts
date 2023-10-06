import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "Skale-subql-starter",
    description:
        "This project can be use as a starting point for developing your new Skale Europa SubQuery project",
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
         * chainId is the EVM Chain ID, for skale this is 2046399126
         * https://chainlist.org/chain/2046399126
         */
        chainId:
            "2046399126",
        /**
         * This endpoint must be a public non-pruned archive node
         * Public nodes may be rate limited, which can affect indexing speed
         * When developing your project we suggest getting a private API key
         * You can get them from OnFinality for free https://app.onfinality.io
         * https://documentation.onfinality.io/support/the-enhanced-api-service
         */
        endpoint: ["https://mainnet.skalenodes.com/v1/elated-tan-skat"],
        // Recommended to provide the HTTP endpoint of a full chain dictionary to speed up processing
        // dictionary: "https://dict-tyk.subquery.network/query/skale-zkevm"
    },
    dataSources: [
        {
            kind: EthereumDatasourceKind.Runtime,
            startBlock: 3238500, // This is the block that the contract was deployed on https://elated-tan-skat.explorer.mainnet.skalenodes.com/token/0x871Bb56655376622A367ece74332C449e5bAc433

            options: {
                // Must be a key of assets
                abi:'erc20',
                // This is the contract address for SKL Token https://elated-tan-skat.explorer.mainnet.skalenodes.com/token/0x871Bb56655376622A367ece74332C449e5bAc433
                address:'0x871bb56655376622a367ece74332c449e5bac433'
            },
            assets: new Map([
                ['erc20', { file: "./abis/erc20.abi.json" }],
            ]),
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
                            topics: ["Transfer(address indexed from, address indexed to, uint256 amount)"],
                        },
                    },
                ],
            },
        },
    ],
    repository: "https://github.com/subquery/ethereum-subql-starter"
};

export default project;
