import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "gnosis-subql-starter",
    description: "This project can be use as a starting point for developing your new Gnosis SubQuery project",
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
         * chainId is the EVM Chain ID, for Gnosis this is 100
         * https://chainlist.org/chain/100
         */
        chainId:
            "100",
        /**
         * This endpoint must be a public non-pruned archive node
         * Public nodes may be rate limited, which can affect indexing speed
         * When developing your project we suggest getting a private API key
         * You can get them from OnFinality for free https://app.onfinality.io
         * https://documentation.onfinality.io/support/the-enhanced-api-service
         */
        endpoint: [
        // "https://gnosis.api.onfinality.io/public",
        // "https://gnosischain-rpc.gateway.pokt.network",
        // "https://opt-mainnet.g.alchemy.com/v2/demo",
            "https://rpc.gnosischain.com",
        ],
        dictionary: "https://api.subquery.network/sq/subquery/gnosis-dictionary"
    },
    dataSources: [
        {
            kind: EthereumDatasourceKind.Runtime,
            // this is the contract address for ChainLink Token on xDai on Gnosis https://gnosisscan.io/token/0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2
            startBlock: 11566752,
            options: {
                // Must be a key of assets
                abi:'erc20',
                address:'0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2'
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
