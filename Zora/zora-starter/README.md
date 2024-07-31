# SubQuery - Example Project for Zora

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [WETH](https://explorer.zora.energy/address/0x4200000000000000000000000000000000000006?tab=logs) on Zora Network**

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
        from {
          id
        }
        to {
          id
        }
        value
        contractAddress
      }
    }
  }
  approvals(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
    nodes {
      id
      blockHeight
      owner {
        id
      }
      spender {
        id
      }
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
        "totalCount": 67,
        "nodes": [
          {
            "id": "0xa710cdc5e37db1c793960208fa5e2f4318296c846d574d08d7f0989400ba05fd-45",
            "blockHeight": "12817169",
            "from": {
              "id": "0x2986d9721A49838ab4297b695858aF7F17f38014"
            },
            "to": {
              "id": "0x86c2Fd1C99D8b7FF541767A4748B2Eb38Fd43dA8"
            },
            "value": "903233271697075519",
            "contractAddress": "0x4200000000000000000000000000000000000006"
          },
          {
            "id": "0x0b45bd5ba8faca3b97e6a6a43ff00f2950e61dab991db3043f8143f8b0873d33-3",
            "blockHeight": "12817164",
            "from": {
              "id": "0x2986d9721A49838ab4297b695858aF7F17f38014"
            },
            "to": {
              "id": "0x1Ed9b524d6f395ECc61aa24537f87a0482933069"
            },
            "value": "663000000000000000",
            "contractAddress": "0x4200000000000000000000000000000000000006"
          },
          {
            "id": "0x19097cfc5f194cc3a506e1ad854af649c86d3b4bd22ccfb0273869f6e4dc32dc-2",
            "blockHeight": "12817168",
            "from": {
              "id": "0x3a3F615b05AAD54d8A7Af1D1B20854f0513278Da"
            },
            "to": {
              "id": "0xa00F34A632630EFd15223B1968358bA4845bEEC7"
            },
            "value": "216276902197952980",
            "contractAddress": "0x4200000000000000000000000000000000000006"
          },
          {
            "id": "0x0b45bd5ba8faca3b97e6a6a43ff00f2950e61dab991db3043f8143f8b0873d33-6",
            "blockHeight": "12817164",
            "from": {
              "id": "0x2986d9721A49838ab4297b695858aF7F17f38014"
            },
            "to": {
              "id": "0x33604ba99Eb25C593caBD53c096c131a72a74752"
            },
            "value": "117000000000000000",
            "contractAddress": "0x4200000000000000000000000000000000000006"
          },
          {
            "id": "0xae0fe6849039164819042f647f6eeb716ce96ebfd31d0d7494b2830f48840880-25",
            "blockHeight": "12817178",
            "from": {
              "id": "0x2986d9721A49838ab4297b695858aF7F17f38014"
            },
            "to": {
              "id": "0x86c2Fd1C99D8b7FF541767A4748B2Eb38Fd43dA8"
            },
            "value": "85497381481813439",
            "contractAddress": "0x4200000000000000000000000000000000000006"
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
- By publishing it to the decentralised [SubQuery Network](https://app.subquery.network), the most open, performant, reliable, and scalable data service for dApp developers. The SubQuery Network indexes and services data to the global community in an incentivised and verifiable way

## What Next?

Take a look at some of our advanced features to take your project to the next level!

- [**Multi-chain indexing support**](https://academy.subquery.network/build/multi-chain.html) - SubQuery allows you to index data from across different layer-1 networks into the same database, this allows you to query a single endpoint to get data for all supported networks.
- [**Dynamic Data Sources**](https://academy.subquery.network/build/dynamicdatasources.html) - When you want to index factory contracts, for example on a DEX or generative NFT project.
- [**Project Optimisation Advice**](https://academy.subquery.network/build/optimisation.html) - Some common tips on how to tweak your project to maximise performance.
- [**GraphQL Subscriptions**](https://academy.subquery.network/run_publish/subscription.html) - Build more reactive front end applications that subscribe to changes in your SubQuery project.

## Need Help?

The fastest way to get support is by [searching our documentation](https://academy.subquery.network), or by [joining our discord](https://discord.com/invite/subquery) and messaging us in the `#technical-support` channel.
