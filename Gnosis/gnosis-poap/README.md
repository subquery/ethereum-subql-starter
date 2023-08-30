# SubQuery - Example Project for Gnosis

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all POAPs mints and transactions on the Gnosis Network**

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
  tokens(first: 5, orderBy: MINT_BLOCK_HEIGHT_DESC) {
    nodes {
      id
      mintBlockHeight
      mintReceiverId
      mintDate
      eventId
    }
  }
  addresses(first: 5, orderBy: TOKENS_BY_CURRENT_HOLDER_ID_COUNT_DESC) {
    nodes {
      id
      tokensByCurrentHolderId(first: 5) {
        totalCount
        nodes {
          id
        }
      }
    }
  }
}
```

You might get data back that looks like this

```json
{
  "data": {
    "tokens": {
      "nodes": [
        {
          "id": "16947",
          "mintBlockHeight": "12293177",
          "mintReceiverId": "0xbcb0d39073ad99aa68fb6d7b2c2a433892af6fb3",
          "mintDate": "2020-10-01T17:04:40",
          "eventId": "361"
        },
        {
          "id": "16946",
          "mintBlockHeight": "12292651",
          "mintReceiverId": "0x05b512f909daae5575afb47b3eeb0b0afeb14c00",
          "mintDate": "2020-10-01T16:20:30",
          "eventId": "69"
        },
        {
          "id": "16945",
          "mintBlockHeight": "12291133",
          "mintReceiverId": "0x0542e8f95f765b81cd6a08db37d914f664db5d3e",
          "mintDate": "2020-10-01T14:13:20",
          "eventId": "405"
        },
        {
          "id": "16944",
          "mintBlockHeight": "12290462",
          "mintReceiverId": "0xa615f34b170329507b37c142f8f812b8e1393beb",
          "mintDate": "2020-10-01T13:16:35",
          "eventId": "405"
        },
        {
          "id": "16943",
          "mintBlockHeight": "12290460",
          "mintReceiverId": "0xe07e487d5a5e1098bbb4d259dac5ef83ae273f4e",
          "mintDate": "2020-10-01T13:16:25",
          "eventId": "405"
        }
      ]
    },
    "addresses": {
      "nodes": [
        {
          "id": "0xb8d7b045d299c9c356bc5ee4fe2dddc8a31280a5",
          "tokensByCurrentHolderId": {
            "totalCount": 1,
            "nodes": [
              {
                "id": "16924"
              }
            ]
          }
        },
        {
          "id": "0xba993c1fee51a4a937bb6a8b7b74cd8dffdca1a4",
          "tokensByCurrentHolderId": {
            "totalCount": 1,
            "nodes": [
              {
                "id": "16912"
              }
            ]
          }
        },
        {
          "id": "0x2b098ce1d5a4f9c2729268a4a3f04b387d4cc7ec",
          "tokensByCurrentHolderId": {
            "totalCount": 1,
            "nodes": [
              {
                "id": "16921"
              }
            ]
          }
        },
        {
          "id": "0x60df279f7cc51d2f0ff903f68c3a8dfcf65419f7",
          "tokensByCurrentHolderId": {
            "totalCount": 1,
            "nodes": [
              {
                "id": "16916"
              }
            ]
          }
        },
        {
          "id": "0x626ea6d1e5ea3fbaba22f5d4005d98e7039d0c99",
          "tokensByCurrentHolderId": {
            "totalCount": 1,
            "nodes": [
              {
                "id": "16919"
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
