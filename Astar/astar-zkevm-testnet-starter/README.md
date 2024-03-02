# SubQuery - Example Project for Astar zkEVM zKatana Testnet

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the GACHA Token ([`0x28687c2A4638149745A0999D523f813f63b4786F`](https://zkatana.blockscout.com/token/0x28687c2A4638149745A0999D523f813f63b4786F)) on Astar zkEVM's zKatana Test Network**

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
        "totalCount": 901,
        "nodes": [
          {
            "id": "0x11c3519a07d48ca7e9b3d77c9c288919e8786dfffaad76bdfd6ae554d2481a13",
            "blockHeight": "3072",
            "from": "0xC6c893a0dCf31b5766Ac5c103AF9e9805A6d0774",
            "to": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
            "value": "4390819482026157205",
            "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
          },
          {
            "id": "0x8d2eed830280b0e35165560f7234da3ccd02f9dc526434e874ccb0e5a464c4f6",
            "blockHeight": "936",
            "from": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
            "to": "0x267816F8789a28463cE10acD50ffeDDE57F318Ee",
            "value": "3499686336793644484",
            "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
          },
          {
            "id": "0x818086a329ca6cecfaf55ac6f3c5a34b985a97ef5439c15bb66f094b4e76a8e5",
            "blockHeight": "2841",
            "from": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
            "to": "0xC6c893a0dCf31b5766Ac5c103AF9e9805A6d0774",
            "value": "3300395407835132030",
            "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
          },
          {
            "id": "0x08e395f3058c05141ab656e08fba91d47d52c9bc954e26f378e4edd3f4ef9d8d",
            "blockHeight": "2435",
            "from": "0x4b8f52c68594554DdF13aff5E2d8d788bC56Ca8c",
            "to": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
            "value": "1794066117854317399",
            "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
          },
          {
            "id": "0x0ac0c00fd9c3bb4ee921e82fe32e658846497697447d9dadffaaec64b2c5ff4a",
            "blockHeight": "2998",
            "from": "0x7D9195077671B08F442B2A1b310858bDB1C4abcc",
            "to": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
            "value": "1430946047728089377",
            "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0xccec6946012d52a27fcae9790ade5a5e7314f934170483fecf2896e3448604bd",
          "blockHeight": null,
          "owner": "0x12680Ad2f3D80b162344Ba3FF3978daB7A565675",
          "spender": "0xd8E1E7009802c914b0d39B31Fc1759A865b727B1",
          "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "contractAddress": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
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
