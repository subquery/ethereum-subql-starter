# SubQuery - Example Project for Kaia

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Orbit Eth](https://scope.klaytn.com/token/0x34d21b1e550d73cee41151c77f3c73359527a396) on Kaia Network**

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

The result should look something like this:

```json
{
  "data": {
    "query": {
      "transfers": {
        "totalCount": 8,
        "nodes": [
          {
            "id": "0x19a332808b2642af38d84951bbe17c044b021be6e587a2f8799ff90419279672",
            "blockHeight": "131207180",
            "from": "0xd3e2Fd9dB41Acea03f0E0c22d85D3076186f4f24",
            "to": "0xa03990511B6ee8BDb24C1693f9f8BD90DDfFd19D",
            "value": "1813529233975307",
            "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
          },
          {
            "id": "0x12581a3f5dcb67a4d5017fa877c1971f130539ceb81949478cf3710f27802c44",
            "blockHeight": "131207054",
            "from": "0x6B0177E96C3623B6F6940dA18378d52f78CeA12D",
            "to": "0x88Fe4fB118c954c11A359AbcE9dc887F7399bE1c",
            "value": "1731405454880983",
            "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
          },
          {
            "id": "0x8df838f5f6e0710c43a15512c353c62ca7ef90b19e77db72f832835d2eab76b1",
            "blockHeight": "131207096",
            "from": "0xc3DA629c518404860c8893a66cE3Bb2e16bea6eC",
            "to": "0xd3e2Fd9dB41Acea03f0E0c22d85D3076186f4f24",
            "value": "160321797378530",
            "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
          },
          {
            "id": "0xc4f94437900be853cc03e0fae2c18650fdde00bd8a26cd080d45dd9051edad42",
            "blockHeight": "131206820",
            "from": "0x6B0177E96C3623B6F6940dA18378d52f78CeA12D",
            "to": "0x71B59e4bC2995B57aA03437ed645AdA7Dd5B1890",
            "value": "18574153690448",
            "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
          },
          {
            "id": "0x6e4c46dad80fa9c55f4d1e6048317f12614b7405321ce36ed7bec8b0e624dffb",
            "blockHeight": "131207283",
            "from": "0xAebFAe557F3948B91c9cb25fc650A26F728C5C9d",
            "to": "0x09267e3E96925C76DfcC2CE39479559A2AB9B8a2",
            "value": "2000000000000",
            "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x61e162fa7e5bbc5edfb462627eaf6d96aaf240ccde102bb0a04ef868bab54c07",
          "blockHeight": null,
          "owner": "0x88Fe4fB118c954c11A359AbcE9dc887F7399bE1c",
          "spender": "0x51D233B5aE7820030A29c75d6788403B8B5d317B",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x34d21b1e550D73cee41151c77F3c73359527a396"
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
