# SubQuery - Example Project for Mantle Mainnet

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Mantle Native token](https://explorer.mantle.xyz/token/0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000/token-transfers) on Mantle Network**

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
        "totalCount": 18,
        "nodes": [
          {
            "id": "0x1c8d6fcdfd8b0d14735eb8163c833409ffce12ee4a213a0a45a2134b9601a5fc",
            "blockHeight": "42793451",
            "from": "0xeb049F1eD546F8efC3AD57f6c7D22F081CcC7375",
            "to": "0xDD8ae36B206C98B0C4090f4cC99B027Af1aaf1d5",
            "value": "80612425581790787",
            "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
          },
          {
            "id": "0xdfce0c1cf01812678344f55a95407b83f8431f1cfda310ab426fd03063746d04",
            "blockHeight": "42793711",
            "from": "0xeb049F1eD546F8efC3AD57f6c7D22F081CcC7375",
            "to": "0xDD8ae36B206C98B0C4090f4cC99B027Af1aaf1d5",
            "value": "78902587928696925",
            "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
          },
          {
            "id": "0xef34fa62cbbe204bfe7ec2deb29153d032551cd35382cf7f9d4b97a1e532a9d0",
            "blockHeight": "42793449",
            "from": "0xd15CF01ffB9955BAcEbbfEdCc8d3ef4D74b4cf6D",
            "to": "0x02f4d0021E3cb8736108E11C8DF02FbBd6EEEDBf",
            "value": "49931668103186702",
            "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
          },
          {
            "id": "0x17e69289ba9f824d2033fcacf3c86c1586440049c7d0aa5dae15b7ddf46e182f",
            "blockHeight": "42793695",
            "from": "0xeb049F1eD546F8efC3AD57f6c7D22F081CcC7375",
            "to": "0xDD8ae36B206C98B0C4090f4cC99B027Af1aaf1d5",
            "value": "16609339097428202",
            "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
          },
          {
            "id": "0x309551011c673c6a267117a5299b90b7aba697bef6b5f8a8b3c9f2866d66a2e0",
            "blockHeight": "42793715",
            "from": "0xBc132b3A5A345069846c5e6f49FE28FeC01E7c47",
            "to": "0xDD8ae36B206C98B0C4090f4cC99B027Af1aaf1d5",
            "value": "6480945280338827",
            "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0xd3028afb9e9f8ee7fd777531b41fb2f51842937a25ae4f4ea8de90177c611375",
          "blockHeight": null,
          "owner": "0x993F759b607bB3831e4d957Fb7aEdADd7447726f",
          "spender": "0x32253394e1C9E33C0dA3ddD54cDEff07E457A687",
          "value": "200000000000000000000",
          "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
        },
        {
          "id": "0xd611c8cf745d85527348218ccd793e5126a5ebecd4340802b8540ee992e3d3bb",
          "blockHeight": null,
          "owner": "0xd15CF01ffB9955BAcEbbfEdCc8d3ef4D74b4cf6D",
          "spender": "0xBBDe1d67297329148Fe1ED5e6B00114842728e65",
          "value": "499354779359429341",
          "contractAddress": "0x6983D1E6DEf3690C4d616b13597A09e6193EA013"
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
