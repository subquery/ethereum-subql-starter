# SubQuery - Example Project for Base

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all claiming events for the [Bridge to Base NFT](https://basescan.org/token/0xEa2a41c02fA86A4901826615F9796e603C6a4491) on Base Mainnet**

Here is a description from Base team about this NFT collection: *This NFT commemorates you being early — you’re one of the first to teleport into the next generation of the internet as we work to bring billions of people onchain.*

## Start

First, install SubQuery CLI globally on your terminal by using NPM `npm install -g @subql/cli`

You can either clone this GitHub repo, or use the `subql` CLI to bootstrap a clean project in the network of your choosing by running `subql init` and following the prompts.

Don't forget to install dependencies with `npm install` or `yarn install`!

## Editing your SubQuery project

Although this is a working example SubQuery project, you can edit the SubQuery project by changing the following files:

- The project manifest in `project.yaml` defines the key project configuration and mapping handler filters
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
query {
    claims(first: 5) {
      nodes {
        id
        blockHeight
        timestamp
        claimer
        receiver
        tokenId
        quantity
      }
    }
  
  dailyAggregations(orderBy:TOTAL_QUANTITY_ASC){
    nodes{
      id
      totalQuantity
    }
  }
}
```

Result:

```json
{
  "data": {
    "claims": {
      "nodes": [
        {
          "id": "0xd91db90047591afbe6ef1c85d2ad0505ee46be161a82fdb79f569194383ed51e",
          "blockHeight": "2155198",
          "timestamp": "2023-08-03T21:55:43",
          "claimer": "0x0bAE5E0BE6CEA98C61591354a5F43339fdD5b611",
          "receiver": "0x0bAE5E0BE6CEA98C61591354a5F43339fdD5b611",
          "tokenId": "2313836",
          "quantity": "1000"
        },
        {
          "id": "0x0114a68ebb4ee609409931a4c62abd2256a66f0fb91388ca00003765186c0e60",
          "blockHeight": "2155088",
          "timestamp": "2023-08-03T21:52:03",
          "claimer": "0x8A17AD3aB5588AE18B0f875dfb65f7AD61D95bDd",
          "receiver": "0x8A17AD3aB5588AE18B0f875dfb65f7AD61D95bDd",
          "tokenId": "2312064",
          "quantity": "1"
        },
        {
          "id": "0x3ccdc484d705776eba946e67e3577c0a629cc82027da6e866717412a158de9e9",
          "blockHeight": "2155088",
          "timestamp": "2023-08-03T21:52:03",
          "claimer": "0x7a2aaecf0c3bF01411f7AAe7DBB97535a7205498",
          "receiver": "0x7a2aaecf0c3bF01411f7AAe7DBB97535a7205498",
          "tokenId": "2312054",
          "quantity": "10"
        },
        {
          "id": "0x1ab0a99382c2ccbed4b64cf1407be214e5d23deff5028a1e4c751d65a1864c04",
          "blockHeight": "2155087",
          "timestamp": "2023-08-03T21:52:01",
          "claimer": "0x51A7b9AFb62dB473107e4a220CedDa67a8025630",
          "receiver": "0x51A7b9AFb62dB473107e4a220CedDa67a8025630",
          "tokenId": "2311934",
          "quantity": "100"
        },
        {
          "id": "0x7cb2474628b4ca6598c008b47dd3956632813b38c6ade08f64dbf59c7d5ad658",
          "blockHeight": "2155092",
          "timestamp": "2023-08-03T21:52:11",
          "claimer": "0x2B4FC7483C42312C3f62feE98671f7407770f16f",
          "receiver": "0x2B4FC7483C42312C3f62feE98671f7407770f16f",
          "tokenId": "2312138",
          "quantity": "1"
        }
      ]
    },
    "dailyAggregations": {
      "nodes": [
        {
          "id": "2023-08-03",
          "totalQuantity": "3184"
        }
      ]
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
