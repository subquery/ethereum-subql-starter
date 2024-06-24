import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "optopia-starter",
  description:
    "This project can be use as a starting point for developing your new Optopia SubQuery project",
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
     * chainId is the EVM Chain ID, for Optopia this is 62050
     * https://chainlist.org/chain/62050
     */
    chainId: "62050",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://rpc-mainnet.optopia.ai,  https://rpc-mainnet-2.optopia.ai"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 2113893, 
      options: {
        abi: "erc20",
        // This is the contract address for $OPAI(Ethereum)  0xF8e57AC2730D3088D98B79209739b0D5Ba085a03  $OPAI(Optopia)  0xF4C3a4d9568672FB4A8174EfD29dDAB6255E8729(coming soon)  $WETH  0x4200000000000000000000000000000000000006  $USDT  0x05D032ac25d322df992303dCa074EE7392C117b9  $USDC  0xb62F35B9546A908d11c5803ecBBA735AbC3E3eaE
        address: "L1StandardBridgeProxy  0x1adE86B9cc8a50Db747b7aaC32E8527d42c71fC1  L1ERC721BridgeProxy  0xAFc9946b25e3e93208b7E2D477680C5B6e2952be  L1CrossDomainMessengerProxy  0x03D5bc58E7b7E13ba785F67AFA2d2fC49cB2BdF3  OptimismPortalProxy  0x39A90926306E11497EC5FE1C459910258B620edD  OptimismMintableERC20FactoryProxy  0xB77d3ea899ef38c464e19F5A6CBc5a37187DC43c  L2OutputOracleProxy  0xdd80E05004f40815EaEf12ffeE69c2a8A5112aA5  SystemConfigProxy  0x94118F86eE37Fa4Fdb266CDab1e55B8F0D6959D9  ProxyAdmin  0x161aF05fA6BdA1c6E7Ee12839d470931bA796948  AddressManager  0x039A3B4AF85A91626f428b8B881603b6DD1f6C4C  ProxyAdminOwner  0x2C73A1610EE822a8C2C21eddd455e725A3334c8C  SystemConfigOwner  0xd01De08Cc118Cc1a1b39c54c8b4ff02A8ADE63eE  Guardian  0xd01De08Cc118Cc1a1b39c54c8b4ff02A8ADE63eE  Challenger  0xd01De08Cc118Cc1a1b39c54c8b4ff02A8ADE63eE",
      },
      assets: new Map([["erc20", { file: "./abis/erc20.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Call, // We use ethereum handlers since Optopia is EVM-compatible
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
