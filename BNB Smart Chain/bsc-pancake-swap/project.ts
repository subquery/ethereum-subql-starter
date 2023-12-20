import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "subquery-example-pancakeswwap-v3",
  description:
    "This project can be use as a starting point for developing your new Ethereum SubQuery project, it indexes the standard PancakeSwap project on BSC",
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
     * chainId is the EVM Chain ID, for Binance Smart Chain this is 56
     * https://chainlist.org/chain/56
     */
    chainId: "56",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://bsc-dataseed4.ninicoin.io/"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 26956207, // The block when this contract was deployed https://bscscan.com/tx/0x57b6445ade8e733f10303f1b9b89b275cda5a136ef14075f6fd0517e8f3b6c85
      options: {
        // The Pancake Swap contract https://bscscan.com/address/0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865
        abi: "Factory",
        address: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
      },
      assets: new Map([
        ["Factory", { file: "./abis/factory.json" }],
        ["ERC20", { file: "./abis/ERC20.json" }],
        ["ERC20SymbolBytes", { file: "./abis/ERC20SymbolBytes.json" }],
        ["ERC20NameBytes", { file: "./abis/ERC20NameBytes.json" }],
        ["Pool", { file: "./abis/pool.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handlePoolCreated",
            filter: {
              topics: [
                "PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
              ],
            },
          },
        ],
      },
    },
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 26931961,
      options: {
        // Must be a key of assets
        abi: "NonfungiblePositionManager",
        address: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
      },
      assets: new Map([
        [
          "NonfungiblePositionManager",
          { file: "./abis/NonfungiblePositionManager.json" },
        ],
        ["Pool", { file: "./abis/pool.json" }],
        ["ERC20", { file: "./abis/ERC20.json" }],

        ["Factory", { file: "./abis/factory.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleIncreaseLiquidity",
            filter: {
              topics: [
                "IncreaseLiquidity (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDecreaseLiquidity",
            filter: {
              topics: [
                "DecreaseLiquidity (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleCollect",
            filter: {
              topics: [
                "Collect (uint256 tokenId, address recipient, uint256 amount0, uint256 amount1)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransfer",
            filter: {
              topics: ["Transfer (address from, address to, uint256 tokenId)"],
            },
          },
        ],
      },
    },
  ],
  // Since this is a factory contract, we use templates and SubQuery's Dynamic Datasource support
  // https://academy.subquery.network/build/dynamicdatasources.html
  templates: [
    {
      kind: EthereumDatasourceKind.Runtime,
      name: "Pool",
      options: {
        abi: "Pool",
      },
      assets: new Map([
        ["Pool", { file: "./abis/pool.json" }],
        ["ERC20", { file: "./abis/ERC20.json" }],
        ["Factory", { file: "./abis/factory.json" }],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInitialize",
            filter: {
              topics: ["Initialize (uint160,int24)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSwap",
            filter: {
              topics: [
                "Swap (address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleMint",
            filter: {
              topics: [
                "Mint(address sender, address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleBurn",
            filter: {
              topics: [
                "Burn(indexed address,indexed int24,indexed int24,uint128,uint256,uint256)",
              ],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFlash",
            filter: {
              topics: [
                "Flash(indexed address,indexed address,uint256,uint256,uint256,uint256)",
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
