# SubQuery - Example ENS Project for Ethereum

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all ENS Records in the ENS registry on Ethereum Mainnet**

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
  domains(first: 5, orderBy: SUBDOMAIN_COUNT_DESC) {
    nodes {
      id
      name
      labelName
      subdomains(first: 5) {
        totalCount
        nodes {
          id
          name
          labelName
        }
      }
    }
  }
}
```

You will see results like this

```json
{
  "data": {
    "domains": {
      "nodes": [
        {
          "id": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "name": null,
          "labelName": null,
          "subdomains": {
            "totalCount": 2,
            "nodes": [
              {
                "id": "0x825726c8cd4176035fe52b95bc1aef3c27e841545bd3a431079f38641c7ba88c",
                "name": "0xdec08c9dbbdd0890e300eb5062089b2d4b1c40e3673bbccb5423f7b37dcf9a9c",
                "labelName": "0xdec08c9dbbdd0890e300eb5062089b2d4b1c40e3673bbccb5423f7b37dcf9a9c"
              },
              {
                "id": "0xd1b0e2eec983ad6a7fb21f6fc706af8717b12b8814d2596016750ea73e00b57f",
                "name": "0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0",
                "labelName": "0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0"
              }
            ]
          }
        },
        {
          "id": "0x352b3a53b6861a6c39477ba530d607cc922b3469121b1b1cb533c2b66805007c",
          "name": null,
          "labelName": "0xe5e14487b78f85faa6e1808e89246cf57dd34831548ff2e6097380d98db2504a",
          "subdomains": {
            "totalCount": 0,
            "nodes": []
          }
        },
        {
          "id": "0x79700a4bad07bddf30b55c0c41297f727c853ae7ac64667e009df49a9ab68dfd",
          "name": null,
          "labelName": "0xc384f2a2b2ac833e2abf795bf38a38f0865833233b8f67cecd7598bd108a2859",
          "subdomains": {
            "totalCount": 0,
            "nodes": []
          }
        },
        {
          "id": "0x825726c8cd4176035fe52b95bc1aef3c27e841545bd3a431079f38641c7ba88c",
          "name": "0xdec08c9dbbdd0890e300eb5062089b2d4b1c40e3673bbccb5423f7b37dcf9a9c",
          "labelName": "0xdec08c9dbbdd0890e300eb5062089b2d4b1c40e3673bbccb5423f7b37dcf9a9c",
          "subdomains": {
            "totalCount": 0,
            "nodes": []
          }
        },
        {
          "id": "0xd1b0e2eec983ad6a7fb21f6fc706af8717b12b8814d2596016750ea73e00b57f",
          "name": "0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0",
          "labelName": "0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0",
          "subdomains": {
            "totalCount": 0,
            "nodes": []
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
