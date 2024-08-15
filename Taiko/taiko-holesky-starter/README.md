# SubQuery - Example Project for Taiko Holesky

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Taiko Token Katla (TTKOk)](https://holesky.etherscan.io/address/0x8C5ac30834D3f85a66B1D19333232bB0a9ca2Db0) on Taiko Holesky**

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
  approvals(first: 2, orderBy: BLOCK_HEIGHT_DESC) {
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

Following the execution of the query, you will receive a result resembling the following format:

```json
{
  "data": {
    "query": {
      "transfers": {
        "nodes": [
          {
            "id": "0xdc6a07724d17acbf2983f3620b2f1372e25f75944f5ae757ba8dd2ab3796c8ee",
            "blockHeight": "855554",
            "from": "0x5CBFccd27dB8A3981FE9965b0de59D436B2BD8b9",
            "to": "0x199fd483B45BAcf80DC14BF396a9e3FE85682A2F",
            "value": "6851466905623",
            "contractAddress": "0x2a99837850543e223C134687f0c2B7E059873047"
          },
          {
            "id": "0xdb3d7ba0b9520c34f3d2b6804dcf2513650eb9937ef6b4854370c00cda0dd58f",
            "blockHeight": "855410",
            "from": "0xD2C3cbB943FEd0Cfc8389b14a3f6df518fD46346",
            "to": "0x50D98FAF3B09D121b0C47Fa31549F958C69a3160",
            "value": "3125472034246",
            "contractAddress": "0x2a99837850543e223C134687f0c2B7E059873047"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0xdac0ce697db180f38747979bff8f54e134fc4aa36dbdfee7cc8b6a5b2234b6d3",
          "blockHeight": null,
          "owner": "0x393B21f2b985792D473bF71765C5D509D00c0fd1",
          "spender": "0xfdE807B7C79f69F22622aCB73db5b59654e115B6",
          "value": "440531404",
          "contractAddress": "0x2a99837850543e223C134687f0c2B7E059873047"
        },
        {
          "id": "0x65ccb8f75817be394a5a86dd7d4c92ab0d9b35a90bca58f391ca007e701a75fd",
          "blockHeight": null,
          "owner": "0x5980b98BB06dec70B3609522221a6CCd3A95FF56",
          "spender": "0x5CBFccd27dB8A3981FE9965b0de59D436B2BD8b9",
          "value": "0",
          "contractAddress": "0x2a99837850543e223C134687f0c2B7E059873047"
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
