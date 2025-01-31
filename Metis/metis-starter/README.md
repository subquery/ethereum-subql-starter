# SubQuery - Example Project for Metis

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Metis Token](https://andromeda-explorer.metis.io/token/0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000/token-transfers) on Metis Network**

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
        "totalCount": 165,
        "nodes": [
          {
            "id": "0x648205a34608e574a2de7bed21364c2a14709835e2d875194e45b43fb887c2dc",
            "blockHeight": "8408065",
            "from": "0x4A51Cb0A8fb5c45a7F2DDfB95CF3B8d58E9dAa67",
            "to": "0x4DF37CC3C48eC3EB689c8Bf0D91249cE2506f73B",
            "value": "201635067077558703872",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0xf468387e997af19aae847614c3b2fed43fa0d4ec0787b3374a327496c87a80a8",
            "blockHeight": "8408085",
            "from": "0x4DF37CC3C48eC3EB689c8Bf0D91249cE2506f73B",
            "to": "0x4A51Cb0A8fb5c45a7F2DDfB95CF3B8d58E9dAa67",
            "value": "199999999117730942120",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0x113c5cbf0c99a8e69068ed37a17d40e07242be9d6758b7a7c5746bf92ea2e6c4",
            "blockHeight": "8407056",
            "from": "0x81b9FA50D5f5155Ee17817C21702C3AE4780AD09",
            "to": "0xc9b290FF37fA53272e9D71A0B13a444010aF4497",
            "value": "198693041920000000000",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0xd90361778969de6a3a730c2148d839de6da92a0e39b90ef52ac6242714cc20c0",
            "blockHeight": "8407168",
            "from": "0xf7906a45Be80aAd89399c3aB1e95a516B297f8c9",
            "to": "0x4A51Cb0A8fb5c45a7F2DDfB95CF3B8d58E9dAa67",
            "value": "131154997018739080801",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0x702fcdf7c4fe1001929c29ace3cd410c9a26d3bbe78683f61643cd445088971f",
            "blockHeight": "8406674",
            "from": "0xa7F01B3B836d5028AB1F5Ce930876E7e2dda1dF8",
            "to": "0xAf7063edA3A026e27963287FCbbb5cFDBc4ea7DE",
            "value": "93257374246577228433",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x788a80ec21535d6c7ff916e179e1c54daddf6ba5ff9bbb0470af0065210adb2d",
          "blockHeight": null,
          "owner": "0x90811C6839f1a792104B9eD1c54290ba1dD60D98",
          "spender": "0x2d4F788fDb262a25161Aa6D6e8e1f18458da8441",
          "value": "1290726706608877427",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
          "id": "0x80116e7301b06b918ab7c88ed5018db3fc01399468a0eca7c34b5f691aa7057d",
          "blockHeight": null,
          "owner": "0x76C743184eD8F8b07762f1Af98B1EdaD953cdE6c",
          "spender": "0x1fc37a909cB3997f96cE395B3Ee9ac268C9bCcdb",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
          "id": "0x73940df7a0af12de0e2a2ec27e6461bed1b7a6330db159938b965fefa56c6398",
          "blockHeight": null,
          "owner": "0xe9030089F4617d4Aa6eE75b5fcA8685543F0e1A0",
          "spender": "0x1fc37a909cB3997f96cE395B3Ee9ac268C9bCcdb",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
          "id": "0x1ca0df7ee186db823b2fecb80b6fe21936dc2cdeaec3dab54ff33f145d87d58b",
          "blockHeight": null,
          "owner": "0x1F1e4e3B02268d87d3b6f9043f3B4D96aB244e34",
          "spender": "0x1fc37a909cB3997f96cE395B3Ee9ac268C9bCcdb",
          "value": "697763915137477220",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
          "id": "0x81386da3bc1960b7e78ca9853d9141fddea6878fbf7aabb3c9324cff092b07be",
          "blockHeight": null,
          "owner": "0x90811C6839f1a792104B9eD1c54290ba1dD60D98",
          "spender": "0x2d4F788fDb262a25161Aa6D6e8e1f18458da8441",
          "value": "1301646906396793218",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        }
      ]
    }
  }
}
```

You can explore the different possible queries and entities to help you with GraphQL using the documentation draw on the right.

## Publish your project

SubQuery is open-source and designed to be easy to run, meaning you have the freedom to run it a variety of ways:

- [Locally on your own computer or on your cloud provider of choice.](https://academy.subquery.network/indexer/run_publish/introduction.html#locally-run-it-yourself)
- [By publishing it to the decentralised SubQuery Network](https://academy.subquery.network/indexer/run_publish/introduction.html#publish-to-the-subquery-network), the most open, performant, reliable, and scalable data service for dApp developers.
- [Leveraging a centralised hosting partner in the SubQuery community](https://academy.subquery.network/indexer/run_publish/introduction.html#other-hosting-providers-in-the-subquery-community), like OnFinality or Traceye.

## What Next?

Take a look at some of our advanced features to take your project to the next level!

- [**Multi-chain indexing support**](https://academy.subquery.network/build/multi-chain.html) - SubQuery allows you to index data from across different layer-1 networks into the same database, this allows you to query a single endpoint to get data for all supported networks.
- [**Dynamic Data Sources**](https://academy.subquery.network/build/dynamicdatasources.html) - When you want to index factory contracts, for example on a DEX or generative NFT project.
- [**Project Optimisation Advice**](https://academy.subquery.network/build/optimisation.html) - Some common tips on how to tweak your project to maximise performance.
- [**GraphQL Subscriptions**](https://academy.subquery.network/run_publish/subscription.html) - Build more reactive front end applications that subscribe to changes in your SubQuery project.

## Need Help?

The fastest way to get support is by [searching our documentation](https://academy.subquery.network), or by [joining our discord](https://discord.com/invite/subquery) and messaging us in the `#technical-support` channel.
