# SubQuery - Example Project for Boba (Ethereum)

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped Eth](https://bobascan.com/address/0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000) on Boba (Ethereum) Network. Boba Network has 2 blockchains for now Boba ETH and Boba BNB. This project is for Boba ETH network (288)**

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
        "totalCount": 21,
        "nodes": [
          {
            "id": "0xffe50d2e3e50c7bfa09500d36ca7ae75de1891c929ce408e2c75c261504f6da4",
            "blockHeight": "1049554",
            "from": "0x547b227A77813Ea70Aacf01212B39Db7b560fa1c",
            "to": "0x17C83E2B96ACfb5190d63F5E46d93c107eC0b514",
            "value": "479864790439106520",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0x4bd23400942cf728b59996067cd2d62bbad238337829699968aeebf7a560f087",
            "blockHeight": "1049572",
            "from": "0x92E1ABD0688f2DaD6bAeF1bA550B3DB8496C6bf0",
            "to": "0x4F059F8d45230Cd5B37544E87eeBba033A5f1b17",
            "value": "182699882986823721",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0xf0f62948ba7019fc8566c13ca1d7d0b40e2d4a7969313005b282c56f30ee33ca",
            "blockHeight": "1049659",
            "from": "0x92E1ABD0688f2DaD6bAeF1bA550B3DB8496C6bf0",
            "to": "0x4F059F8d45230Cd5B37544E87eeBba033A5f1b17",
            "value": "182107694671145841",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0x28d3b1dc6c033eb7d34c833845dc942d3039c404f56df0a3dacfed27c43052bd",
            "blockHeight": "1049564",
            "from": "0x247442181b8bAA03b3c7DC0D8e971bD4686db27c",
            "to": "0x4F059F8d45230Cd5B37544E87eeBba033A5f1b17",
            "value": "146018112402773964",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          },
          {
            "id": "0x2d4fb3b93b06c3ecf957fab960c4d491bac4d16a3d24c969c98ed8d200652b19",
            "blockHeight": "1049555",
            "from": "0x0000000000d854E9Db5fDE8955F123283C41B489",
            "to": "0x547b227A77813Ea70Aacf01212B39Db7b560fa1c",
            "value": "133418544049988760",
            "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x5457b8e60bf56db8fb6cbca09407a6156fda5fcc5775e3bc13c4af12b46bdcc7",
          "blockHeight": null,
          "owner": "0x71A1B05506CAf8596b21f21Ac64E4818b8464867",
          "spender": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
          "value": "18043891388642118",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
        },
        {
          "id": "0xcbb77916b8aba6cf3df541c436ce14e71346f5a80c73e66c081dfe1e6dcce264",
          "blockHeight": null,
          "owner": "0x71A1B05506CAf8596b21f21Ac64E4818b8464867",
          "spender": "0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278",
          "value": "18043891388642118",
          "contractAddress": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
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
