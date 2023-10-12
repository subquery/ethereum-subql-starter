import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "polygon-zkevm-starter",
    description:
        "This project can be use as a starting point for developing your new polygon zkEVM SubQuery project",
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
         * chainId is the EVM Chain ID, for Polygon zkEVM this is 1101
         * https://chainlist.org/chain/1101
         */
        chainId:
            "1101",
        /**
         * This endpoint must be a public non-pruned archive node
         * Public nodes may be rate limited, which can affect indexing speed
         * When developing your project we suggest getting a private API key
         * You can get them from OnFinality for free https://app.onfinality.io
         * https://documentation.onfinality.io/support/the-enhanced-api-service
         */
        endpoint: ["https://zkevm-rpc.com"],
        // Recommended to provide the HTTP endpoint of a full chain dictionary to speed up processing
        dictionary: "https://dict-tyk.subquery.network/query/polygon-zkevm"
    },
    dataSources: [
        {
            kind: EthereumDatasourceKind.Runtime,
            startBlock: 1, // This is the block that the contract was deployed on https://zkevm.polygonscan.com/token/0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9
            options: {
                // Must be a key of assets
                abi:'erc20',
                // This is the contract address for Wrapped Ether https://zkevm.polygonscan.com/token/0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9
                address:'0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9'
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
