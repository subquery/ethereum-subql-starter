# SubQuery - Example Project for Avalanche Fuji

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped AVAX](https://testnet.snowtrace.io/token/0x1d308089a2d1ced3f1ce36b1fcaf815b07217be3) on Avalanche Fuji's Network**

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
        "totalCount": 10,
        "nodes": [
          {
            "id": "0xfa66a0ae0e05c20e51974b509c3eed94605ec56d0771c60f1bad90ad9ff227ae",
            "blockHeight": "1784",
            "from": "0xfF9DE50AfC19da9B849BCa3F84A1684dc2BCe538",
            "to": "0x7690966AdBB4Cc987b82363B90cA292632dF42A2",
            "value": "1000000000000000000",
            "contractAddress": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
          },
          {
            "id": "0xf9f780c06feaaafdab9b743902aa18d2dc580e82c5dad7bf95a58e7c8aff84bd",
            "blockHeight": "1815",
            "from": "0xfF9DE50AfC19da9B849BCa3F84A1684dc2BCe538",
            "to": "0x7690966AdBB4Cc987b82363B90cA292632dF42A2",
            "value": "999999999999999999",
            "contractAddress": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
          },
          {
            "id": "0xb2d4b38e55d32cbc262022e0da26a3875118ba2241d3c3035df27a355d3c3acf",
            "blockHeight": "1810",
            "from": "0x7690966AdBB4Cc987b82363B90cA292632dF42A2",
            "to": "0xfF9DE50AfC19da9B849BCa3F84A1684dc2BCe538",
            "value": "991112727858192938",
            "contractAddress": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
          },
          {
            "id": "0xd0717f960ace3afffb6cece541dd14aeda987af5546f5ad490ab130cbcfdd1ac",
            "blockHeight": "1790",
            "from": "0xfF9DE50AfC19da9B849BCa3F84A1684dc2BCe538",
            "to": "0xeB777D4eE849EaC93981f6308FE5698EDB7708Cb",
            "value": "100000000000000000",
            "contractAddress": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
          },
          {
            "id": "0x0870c4e07f296fc9a519afe0862cbef2062b2c21c5cde3a6b3c7423e7b2366ce",
            "blockHeight": "1826",
            "from": "0xeB777D4eE849EaC93981f6308FE5698EDB7708Cb",
            "to": "0x7690966AdBB4Cc987b82363B90cA292632dF42A2",
            "value": "10515079459239863",
            "contractAddress": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
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
