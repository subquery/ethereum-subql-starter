# SubQuery - Example Project for Ethereum Goerli

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped Eth](https://goerli.etherscan.io/address/0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6) on Ethereum Goerli's Network**

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
        "totalCount": 93,
        "nodes": [
          {
            "id": "0xcb342c1f74711ea5e5abfde29dd51d4f3a61cc45c975c5a68f241ee122a4a959",
            "blockHeight": "8956022",
            "from": "0x6337B3caf9C5236c7f3D1694410776119eDaF9FA",
            "to": "0x4648a43B2C14Da09FdF82B161150d3F634f40491",
            "value": "4855673442571623825",
            "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          },
          {
            "id": "0xaae7e2d6dc548851b361d299ed4a8ee374044b33c8a48a71ef964ab3680a5874",
            "blockHeight": "8956021",
            "from": "0x4c24746eb19007195fa7b0DDb48b12251455ced1",
            "to": "0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649",
            "value": "999940092742548026",
            "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          },
          {
            "id": "0x76ca79bbcee6c0d96250859993550994c71db468c2781387069fce0fdfb8e5e4",
            "blockHeight": "8956016",
            "from": "0x4648a43B2C14Da09FdF82B161150d3F634f40491",
            "to": "0xF79817bD541D686F926aDCd01a950472B8AB890D",
            "value": "778800000000000000",
            "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          },
          {
            "id": "0x063bae400cf94c5a99128e5d2234d70b0808b861e6d975ec8d749405815255c2",
            "blockHeight": "8956008",
            "from": "0x4648a43B2C14Da09FdF82B161150d3F634f40491",
            "to": "0xF79817bD541D686F926aDCd01a950472B8AB890D",
            "value": "610500000000000000",
            "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          },
          {
            "id": "0xa3b41e764c52017b3003e4de5049566652281cd2204c6d92f5e44d1f09032c54",
            "blockHeight": "8956001",
            "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            "to": "0xb3A16C2B68BBB0111EbD27871a5934b949837D95",
            "value": "500000000000000000",
            "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x9c133e295d14d31954a776e30dbe626d5c0930e4ac33bd6613cdd1bd2618fb53",
          "blockHeight": null,
          "owner": "0x32ceA17539BF6Ae52D08906bB943e6bfE4b19FA1",
          "spender": "0x000000000022D473030F116dDEE9F6B43aC78BA3",
          "value": "5970000000000000",
          "contractAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
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
