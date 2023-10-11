import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "bsc-mobox-rewards",
    description:
        "This project indexes all deposits and withdrawls to MOBOX pools",
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
         * chainId is the EVM Chain ID, for BSC this is 56
         * https://chainlist.org/chain/56
         */
        chainId:
            "56",
        /**
         * This endpoint must be a public non-pruned archive node
         * Public nodes may be rate limited, which can affect indexing speed
         * When developing your project we suggest getting a private API key
         * You can get them from OnFinality for free https://app.onfinality.io
         * https://documentation.onfinality.io/support/the-enhanced-api-service
         */
        endpoint: ["https://bsc-dataseed1.binance.org"],
        dictionary: "https://dict-tyk.subquery.network/query/binance"
    },
    dataSources: [
        {
            kind: EthereumDatasourceKind.Runtime,
            startBlock: 17047980, //The block on which the Mobox Farming contract was deployed

            options: {
                // Must be a key of assets
                abi:'mobox_abi',
                // this is the contract address for Mobox Farming contract https://bscscan.com/address/0xa5f8c5dbd5f286960b9d90548680ae5ebff07652#code
                address:'0xa5f8c5dbd5f286960b9d90548680ae5ebff07652'
            },
            assets: new Map([
                ['mobox_abi', { file: "mobox.abi.json" }],
            ]),
            mapping: {
                file: "./dist/index.js",
                handlers: [
                    {
                        kind: EthereumHandlerKind.Event,
                        handler: "handleDeposit",
                        filter: {
                            topics: ["Deposit(address indexed user, uint256 indexed pid, uint256 amount)"],
                        },
                    },
                    {
                        kind: EthereumHandlerKind.Event,
                        handler: "handleWithdraw",
                        filter: {
                            topics: ["Withdraw(address indexed user, uint256 indexed pid, uint256 amount)"],
                        },
                    },
                ],
            },
        },
    ],
    repository: "https://github.com/subquery/ethereum-subql-starter"
};

export default project;
