# SubQuery - Example Project for Satoshivm Mainnet

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for [SAVM](https://testnet.svmscan.io/token/0x77726BFbE61B6ad7463466fD521A3A4B89B0EFd8) on Satoshivm Testnet Network**

## Start

First, install SubQuery CLI globally on your terminal by using NPM `npm install -g @subql/cli`

You can either clone this GitHub repo, or use the `subql` CLI to bootstrap a clean project in the network of your choosing by running `subql init` and following the prompts.

Don't forget to install dependencies with `npm install` or `yarn install`!

## Editing your SubQuery project

Although this is a working example SubQuery project, you can edit the SubQuery project by changing the following files:

- The project manifest in `project.ts` defines the key project configuration and mapping handler filters
- The GraphQL Schema (`schema.graphql`) defines the shape of the resulting data that you are using SubQuery to index
- The Mapping functions in `src/mappings/` directory are typescript functions that handle transformation logic

SubQuery supports various layer-1 blockchain networks and provides [dedicated quick start guides](https://academy.subquery.network/quickstart/quickstart.html) as well as [detailed technical documentation](https://academy.subquery.network/build/introduction.html) for each of them.

## Run your project

_If you get stuck, find out how to get help below._

The simplest way to run your project is by running `yarn dev` or `npm run-script dev`. This does all of the following:

1.  `yarn codegen` - Generates types from the GraphQL schema definition and contract ABIs and saves them in the `/src/types` directory. This must be done after each change to the `schema.graphql` file or the contract ABIs
2.  `yarn build` - Builds and packages the SubQuery project into the `/dist` directory
3.  `docker-compose pull && docker-compose up` - Runs a Docker container with an indexer, PostgeSQL DB, and a query service. This requires [Docker to be installed](https://docs.docker.com/engine/install) and running locally. The configuration for this container is set from your `docker-compose.yml`

You can observe the three services start, and once all are running (it may take a few minutes on your first start), please open your browser and head to [http://localhost:3000](http://localhost:3000) - you should see a GraphQL playground showing with the schemas ready to query. [Read the docs for more information](https://academy.subquery.network/run_publish/run.html) or [explore the possible service configuration for running SubQuery](https://academy.subquery.network/run_publish/references.html).

## Query your project

For this project, you can try to query with the following GraphQL code to get a taste of how it works.

```graphql
{
  query {
    transfers(first: 5, orderBy: VALUE_DESC) {
      totalCount
      nodes {
        id
        blockHeight
        from
        to
        value
        contractAddress
      }
    }
  }
  approvals(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
    nodes {
      id
      blockHeight
      owner
      spender
      value
      contractAddress
    }
  }
}
```

The result should look similar to the following:

```json
{
  "data": {
    "query": {
      "transfers": {
        "totalCount": 1574,
        "nodes": [
          {
            "id": "0x1fb3b4712c79fe7100f39d402f48b8b77360a7ebf31d1fd8f0bb09324a6fadca",
            "blockHeight": "520503",
            "from": "0x4EA9983FA42637e44870e16971CC4A76c6D6BC6b",
            "to": "0x07acd0ff6031800f3624f994535DEA410eF97174",
            "value": "23088785671291771493",
            "contractAddress": "0x77726BFbE61B6ad7463466fD521A3A4B89B0EFd8"
          },
          {
            "id": "0xfe951e4f97ab99833c618e42636e181d6cd6df03afd3e24dd57b0b202dab8632",
            "blockHeight": "520450",
            "from": "0x23C96A36bC1AEedef64a2D924911128911C9A2db",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "22000000000000000000",
            "contractAddress": "0x77726BFbE61B6ad7463466fD521A3A4B89B0EFd8"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x5f0b6fc326c16eaf90c1f56b8f1c6083bad68e4226f15861b4e7b18e3fb7a6b6",
          "blockHeight": null,
          "owner": "0xf2D33f173342fE7110893edde92dd8Ce30974b45",
          "spender": "0x23C96A36bC1AEedef64a2D924911128911C9A2db",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x77726BFbE61B6ad7463466fD521A3A4B89B0EFd8"
        },
        {
          "id": "0xe9ff8930ac16bc1de151c93158de4edf6d170cb83c0d893b78ff9f2c6df37b95",
          "blockHeight": null,
          "owner": "0x821D26d3B17355f71e3B582583E70bC1b0a008C2",
          "spender": "0x23C96A36bC1AEedef64a2D924911128911C9A2db",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x77726BFbE61B6ad7463466fD521A3A4B89B0EFd8"
        }
      ]
    }
  }
}
```

You can explore the different possible queries and entities to help you with GraphQL using the documentation draw on the right.

## Publish your project

SubQuery is open-source and designed to be easy to run, meaning you have the freedom to run it a variety of ways:

- [Locally on your own computer or on your cloud provider of choice.](https://academy.subquery.network/indexer/run_publish/introduction.html#locally-run-it-yourself)
- [By publishing it to the decentralised SubQuery Network](https://academy.subquery.network/indexer/run_publish/introduction.html#publish-to-the-subquery-network), the most open, performant, reliable, and scalable data service for dApp developers.
- [Leveraging a centralised hosting partner in the SubQuery community](https://academy.subquery.network/indexer/run_publish/introduction.html#other-hosting-providers-in-the-subquery-community), like OnFinality or Traceye.

## What Next?

Take a look at some of our advanced features to take your project to the next level!

- [**Multi-chain indexing support**](https://academy.subquery.network/build/multi-chain.html) - SubQuery allows you to index data from across different layer-1 networks into the same database, this allows you to query a single endpoint to get data for all supported networks.
- [**Dynamic Data Sources**](https://academy.subquery.network/build/dynamicdatasources.html) - When you want to index factory contracts, for example on a DEX or generative NFT project.
- [**Project Optimisation Advice**](https://academy.subquery.network/build/optimisation.html) - Some common tips on how to tweak your project to maximise performance.
- [**GraphQL Subscriptions**](https://academy.subquery.network/run_publish/subscription.html) - Build more reactive front end applications that subscribe to changes in your SubQuery project.

## Need Help?

The fastest way to get support is by [searching our documentation](https://academy.subquery.network), or by [joining our discord](https://discord.com/invite/subquery) and messaging us in the `#technical-support` channel.
