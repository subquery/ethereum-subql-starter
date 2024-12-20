import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "unichain-testnet-uniswap-v3",
  description:
    "This project can be use as a starting point for developing your new Unichain Testnet SubQuery project",
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
     * chainId is the EVM Chain ID, for Ethereum this is 1
     * https://chainlist.org/chain/1
     */
    chainId: "1301",
    /**
     * These endpoint(s) should be non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://sepolia.unichain.org"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 1,
      options: {
        // Must be a key of assets
        abi: "Factory",
        address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
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
    // ethereum/contract
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 1,
      options: {
        // Must be a key of assets
        abi: "NonfungiblePositionManager",
        address: "0xB7F724d6dDDFd008eFf5cc2834edDE5F9eF0d075",
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
                "Swap(address,address,int256,int256,uint160,uint128,int24,uint128,uint128)",
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
              topics: ["Burn(address,int24,int24,uint128,uint256,uint256)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFlash",
            filter: {
              topics: [
                "Flash(address,address,uint256,uint256,uint256,uint256)",
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
