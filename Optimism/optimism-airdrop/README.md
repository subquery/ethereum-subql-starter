# SubQuery - Example Project for Optimism

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all the claim events of the Optimism Airdrop on Optimism Network**

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

For this project, use the sample GraphQL query below:

```graphql
query {
  claims(first: 2, orderBy: VALUE_DESC) {
    nodes {
      id
      blockHeight
      transactionHash
      value
      blockHeight
      blockTimestamp
      account
    }
  }
  dailyClaimSummaries(first: 2) {
    nodes {
      id
      totalClaimed
      claims(first: 2) {
        totalCount
        nodes {
          id
          account
          value
        }
      }
    }
  }
}
```

Which will return the following:

```json
{
  "data": {
    "claims": {
      "nodes": [
        {
          "id": "129721",
          "blockHeight": "100322581",
          "transactionHash": "0xd6f5506614870547c4b1a318e9f238bf1ee5a52ad6bb2d4907fc39112aff6872",
          "value": "7477664852469040021504",
          "blockTimestamp": "1684714980",
          "account": "0x85399353400C5B67fD6eE53B1d2cd183bAE7dDdb"
        },
        {
          "id": "247333",
          "blockHeight": "100316590",
          "transactionHash": "0x8b2d0390e87adf0a142341e71ad1120e7a94fd64e99277d0b7b9d9eb00671c6b",
          "value": "1746193727981909180416",
          "blockTimestamp": "1684711341",
          "account": "0xfa4d3CD41555d3A0FafD4A97e9ba91882A2f4755"
        }
      ]
    },
    "dailyClaimSummaries": {
      "nodes": [
        {
          "id": "2023-05-23",
          "totalClaimed": "5331450199315913506816",
          "claims": {
            "totalCount": 7,
            "nodes": [
              {
                "id": "170962",
                "account": "0xBf705a542801f6448BfDFAa0AcC5FF95Ef766180",
                "value": "271833778900496351232"
              },
              {
                "id": "208958",
                "account": "0xabD77aF5e15bDA1facE840ba94Fa694Fb96D71fd",
                "value": "271833778900496351232"
              }
            ]
          }
        },
        {
          "id": "2023-05-22",
          "totalClaimed": "14329148973165485490176",
          "claims": {
            "totalCount": 11,
            "nodes": [
              {
                "id": "89049",
                "account": "0x5CAfbD5aE3EBEEfEAE0a1ef6ef21177df4e961a4",
                "value": "271833778900496351232"
              },
              {
                "id": "200636",
                "account": "0xFFFA0D98238609d1b96f6dc875cCCf9220631Ac1",
                "value": "776867362080440975360"
              }
            ]
          }
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
