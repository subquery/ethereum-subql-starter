# SubQuery - Example Project for Heco Chain

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped HT](https://www.hecoinfo.com/en-us/token/0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f) on Heco Chain Network**

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
        "totalCount": 138,
        "nodes": [
          {
            "id": "0x4ef0ea30dcc53c2f572f35b8564d1f212619b112f15a54d3a057940f1ac903db",
            "blockHeight": "29208127",
            "from": "0x499B6E03749B4bAF95F9E70EeD5355b138EA6C31",
            "to": "0x0f1c2D1FDD202768A4bDa7A38EB0377BD58d278E",
            "value": "59360876484123090118",
            "contractAddress": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F"
          },
          {
            "id": "0xdd60a53bef195624123e6a20974f3a3443bdebc235d9134dcb7aacceb07d4dcd",
            "blockHeight": "29206031",
            "from": "0x86f5C8EB736c95dd687182779edd792FEF0fA674",
            "to": "0xFf8376a18Db1889aBDf325CD28F37A12D2685b86",
            "value": "36215012000000000000",
            "contractAddress": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F"
          },
          {
            "id": "0xf50a0293b8d365c5c165e28f2c0308a69b088ebfcb9eff5ff05dac0801251261",
            "blockHeight": "29206116",
            "from": "0x1d3286A3348Fa99852d147C57A79045B41c4f713",
            "to": "0x6Dd2993B50b365c707718b0807fC4e344c072eC2",
            "value": "21420615200068545968",
            "contractAddress": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F"
          },
          {
            "id": "0x8c62b0dad95328fbc6054712750dcda1cccd5af6b47b2ad2a5de6c583c5a5bc2",
            "blockHeight": "29205970",
            "from": "0x1d3286A3348Fa99852d147C57A79045B41c4f713",
            "to": "0x53E458aD1CFEB9582736db6BdE9aF89948e3bc3d",
            "value": "12877194488560758895",
            "contractAddress": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F"
          },
          {
            "id": "0xaf3b5af348f016641fad64c73f72e886287197e2cd66fe7533dbba562e9f772e",
            "blockHeight": "29205977",
            "from": "0x1d3286A3348Fa99852d147C57A79045B41c4f713",
            "to": "0x53E458aD1CFEB9582736db6BdE9aF89948e3bc3d",
            "value": "12863942535019199884",
            "contractAddress": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F"
          }
        ]
      }
    },
    "approvals": {
      "nodes": []
    }
  }
}
```

You can explore the different possible queries and entities to help you with GraphQL using the documentation draw on the right.

## Publish your project

SubQuery is open-source, meaning you have the freedom to run it in the following three ways:

- Locally on your own computer (or a cloud provider of your choosing), [view the instructions on how to run SubQuery Locally](https://academy.subquery.network/run_publish/run.html)
- By publishing it to our enterprise-level [Managed Service](https://managedservice.subquery.network), where we'll host your SubQuery project in production ready services for mission critical data with zero-downtime blue/green deployments. We even have a generous free tier. [Find out how](https://academy.subquery.network/run_publish/publish.html)
- [Coming Soon] By publishing it to the decentralised [SubQuery Network](https://subquery.network/network), the most open, performant, reliable, and scalable data service for dApp developers. The SubQuery Network indexes and services data to the global community in an incentivised and verifiable way

## What Next?

Take a look at some of our advanced features to take your project to the next level!

- [**Multi-chain indexing support**](https://academy.subquery.network/build/multi-chain.html) - SubQuery allows you to index data from across different layer-1 networks into the same database, this allows you to query a single endpoint to get data for all supported networks.
- [**Dynamic Data Sources**](https://academy.subquery.network/build/dynamicdatasources.html) - When you want to index factory contracts, for example on a DEX or generative NFT project.
- [**Project Optimisation Advice**](https://academy.subquery.network/build/optimisation.html) - Some common tips on how to tweak your project to maximise performance.
- [**GraphQL Subscriptions**](https://academy.subquery.network/run_publish/subscription.html) - Build more reactive front end applications that subscribe to changes in your SubQuery project.

## Need Help?

The fastest way to get support is by [searching our documentation](https://academy.subquery.network), or by [joining our discord](https://discord.com/invite/subquery) and messaging us in the `#technical-support` channel.
