# SubQuery - Example Project for Fantom Opera

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped FTM](https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83) on Fantom Opera Network**

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

Your result should look similar to the following:

```json
{
  "data": {
    "query": {
      "transfers": {
        "totalCount": 459,
        "nodes": [
          {
            "id": "0x57b54d4bf53caca4c60772761f4949e4dc02d92f62a02b180d5b382d50b7787d",
            "blockHeight": "67295406",
            "from": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "176970961833699983570796",
            "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
          },
          {
            "id": "0x128198372b0080d144f01041bdeb97e39155981010337abc8dc18878727af227",
            "blockHeight": "67295494",
            "from": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "to": "0x4EE115137ac73A3e5F99598564905465C101b11F",
            "value": "160977046912584985744989",
            "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
          },
          {
            "id": "0xaca3354ec2d60bc8816590e32c755a87269a07d1eef7c7a49f808d9d6aee9f18",
            "blockHeight": "67296279",
            "from": "0x38C2853E569125Fc9Af310Ab145FCEfB2A07A322",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "10000000000000000000000",
            "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
          },
          {
            "id": "0x5f549d1546f590146b87091c9bdfde18ff1f3d33b6ed852fc454af810a4c0e32",
            "blockHeight": "67296232",
            "from": "0x5BAB9d61f84630A76fA9e2f67739f2da694B5402",
            "to": "0x245cD6d33578de9aF75a3C0c636c726b1A8cbdAa",
            "value": "6996500000000000000000",
            "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
          },
          {
            "id": "0x6158b4cc15013f08e89c91cef0d1610cd37d7d303126299900689790ecb8124e",
            "blockHeight": "67295446",
            "from": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "6844335953031983950296",
            "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x7e08e7e27996561ba385b9ffc6a9a02d51ad17a22a9bbb9e79a6ad059f269720",
          "blockHeight": null,
          "owner": "0xDEc89FC2ECfF1F2197204126EaAc55043155153b",
          "spender": "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
        },
        {
          "id": "0xa00b913d56a1e91a6fdc52e05f56db54e518a1fbbd81e94ccc4b0d3521c72c53",
          "blockHeight": null,
          "owner": "0xDEc89FC2ECfF1F2197204126EaAc55043155153b",
          "spender": "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
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
- By publishing it to the decentralised [SubQuery Network](https://app.subquery.network), the most open, performant, reliable, and scalable data service for dApp developers. The SubQuery Network indexes and services data to the global community in an incentivised and verifiable way

## What Next?

Take a look at some of our advanced features to take your project to the next level!

- [**Multi-chain indexing support**](https://academy.subquery.network/build/multi-chain.html) - SubQuery allows you to index data from across different layer-1 networks into the same database, this allows you to query a single endpoint to get data for all supported networks.
- [**Dynamic Data Sources**](https://academy.subquery.network/build/dynamicdatasources.html) - When you want to index factory contracts, for example on a DEX or generative NFT project.
- [**Project Optimisation Advice**](https://academy.subquery.network/build/optimisation.html) - Some common tips on how to tweak your project to maximise performance.
- [**GraphQL Subscriptions**](https://academy.subquery.network/run_publish/subscription.html) - Build more reactive front end applications that subscribe to changes in your SubQuery project.

## Need Help?

The fastest way to get support is by [searching our documentation](https://academy.subquery.network), or by [joining our discord](https://discord.com/invite/subquery) and messaging us in the `#technical-support` channel.
