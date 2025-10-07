# SubQuery - Example Project for Taiko Katla

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Bridged Taiko Token Katla (TTKOk.t)](https://katla.taikoscan.network/address/0x2a99837850543e223C134687f0c2B7E059873047/contract/167008/) on Taiko Katla**

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
    transfers(first: 2, orderBy: VALUE_DESC) {
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
}
```

Following the execution of the query, you will receive a result resembling the following format:

```json
{
  "data": {
    "query": {
      "transfers": {
        "totalCount": 41,
        "nodes": [
          {
            "id": "0x29fd8f0384b0eba1b081fa2a1f4bcd6036c772562332999db1e6e9de05e71778",
            "blockHeight": "1360254",
            "from": "0x06415BDa9CEBFbB54d81278e6b4c8a160c33bC55",
            "to": "0xB20BB9105e007Bd3E0F73d63D4D3dA2c8f736b77",
            "value": "1000000000000000000000",
            "contractAddress": "0x8C5ac30834D3f85a66B1D19333232bB0a9ca2Db0"
          },
          {
            "id": "0x22b377fd88ef502ddd816a16cc1dde4eb908fef63d0a3f5c359960e984609dbf",
            "blockHeight": "1360254",
            "from": "0x06415BDa9CEBFbB54d81278e6b4c8a160c33bC55",
            "to": "0xB20BB9105e007Bd3E0F73d63D4D3dA2c8f736b77",
            "value": "1000000000000000000000",
            "contractAddress": "0x8C5ac30834D3f85a66B1D19333232bB0a9ca2Db0"
          }
        ]
      }
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
