# SubQuery - Example Project for Polygon Mumbai

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped Eth](https://mumbai.polygonscan.com/token/0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa) on Polygon Mumbai's Network**

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
        "totalCount": 7,
        "nodes": [
          {
            "id": "0xfc02d66a2d170df9fb307fc48480a4acb748b0c5cd3e5c06056b701f25bf73d4",
            "blockHeight": "29607355",
            "from": "0x30628e843Bd9A10fc475aa3baA9fF1D08333960a",
            "to": "0xc9Be70c32693970172F2b7d3C828673314086e7b",
            "value": "47400212415827049",
            "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
          },
          {
            "id": "0x5e676271eeca2f20cde3e09334b75037bbc8a58f667832462bae3b902b9fc377",
            "blockHeight": "29605828",
            "from": "0x2d975bDa61d89d35f259dAdeAe40693fA17842B8",
            "to": "0xEB8385A83fd9D91889c60487Aeb2F4495F04c9F9",
            "value": "10144216690787271",
            "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
          },
          {
            "id": "0x43cdf37475fde8e5620b6f732f0550a4c7dab67a7a61f460b60c9c51a3e57e9f",
            "blockHeight": "29606975",
            "from": "0xc1FF5D622aEBABd51409e01dF4461936b0Eb4E43",
            "to": "0x39f3b9C8585Fc57A57EC39322E92Face43484D97",
            "value": "136565991130049",
            "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
          },
          {
            "id": "0x1fe11447c36069cd93bf446e4a3093513ed5893d6326dcaac8bac283ab559bca",
            "blockHeight": "29607247",
            "from": "0x39f3b9C8585Fc57A57EC39322E92Face43484D97",
            "to": "0xcDe7a88a1dada60CD5c888386Cc5C258D85941Dd",
            "value": "96250000000000",
            "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
          },
          {
            "id": "0x3857be80c2478f56ea5bdece0993658b951c24cb8028f2b52c2547d4787bec33",
            "blockHeight": "29607290",
            "from": "0xcDe7a88a1dada60CD5c888386Cc5C258D85941Dd",
            "to": "0x39f3b9C8585Fc57A57EC39322E92Face43484D97",
            "value": "87500000000000",
            "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0xa4ca08a96a8ffbf66141a70c20c8e9685c5c620779d5b019408df4f65b1aa315",
          "blockHeight": null,
          "owner": "0x39f3b9C8585Fc57A57EC39322E92Face43484D97",
          "spender": "0x1E0049783F008A0085193E00003D00cd54003c71",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"
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
