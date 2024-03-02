# SubQuery - Example Project for Polygon zkEVM Sepolia

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transfers and approval events for the [Wrapped BNB](https://testnet.bscscan.com/address/0xae13d989dac2f0debff460ac112a837c89baa7cd) on BSC Testnet's Network**

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
        "totalCount": 12,
        "nodes": [
          {
            "id": "0x4cd1b558b1f4dcd0282306aa616eca9f471d43f9ad2e215fdc89842599fff41b",
            "blockHeight": "30738117",
            "from": "0x4cc661636e863438CDD3997FeF97F7834c18F30a",
            "to": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
            "value": "127102935664186759",
            "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          },
          {
            "id": "0xb0fdfa888f4bf485c5e1fe7da7cd0602a24428cb7bc4cba4ee3c43e61a15f20d",
            "blockHeight": "30738255",
            "from": "0x79e06f034Cf960B360fFb0FE6C300aFF9E091d98",
            "to": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
            "value": "30485080530383172",
            "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          },
          {
            "id": "0x3e9e81c473adb26aa5b73767ff98adf2cc1541170d222920ca66e368fcc6e946",
            "blockHeight": "30738226",
            "from": "0x79e06f034Cf960B360fFb0FE6C300aFF9E091d98",
            "to": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
            "value": "18284534394168783",
            "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          },
          {
            "id": "0x231409b8a5cee2699ca7c8a2dda81c18b6ccad2c4f4724fd06d26d80ee996fb4",
            "blockHeight": "30738224",
            "from": "0x79e06f034Cf960B360fFb0FE6C300aFF9E091d98",
            "to": "0x94D13A9CF6cFeD7089C2e487dCC53C25cB0AcF1a",
            "value": "10058176217011011",
            "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          },
          {
            "id": "0xe8fb6aa646fc77d8f594f324f0f23eb9321307e3b36d04f17df920c06e630337",
            "blockHeight": "30738224",
            "from": "0x79e06f034Cf960B360fFb0FE6C300aFF9E091d98",
            "to": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
            "value": "10053489076891799",
            "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          }
        ]
      }
    },
    "approvals": {
      "nodes": [
        {
          "id": "0x7cdf7d0a5e1be777c8cb2773ce0a157b1d18a5e91a77dd36793c5f9dbfcaa4a4",
          "blockHeight": null,
          "owner": "0xCBF177f46913069f6315219f243Dc14a21605fC8",
          "spender": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
          "value": "100000000000000000",
          "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        },
        {
          "id": "0xac01452db99cb5e50d5defd20c72a88cb4286816fedd088709023c36c0e1ae85",
          "blockHeight": null,
          "owner": "0xCBF177f46913069f6315219f243Dc14a21605fC8",
          "spender": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
          "value": "100000000000000000",
          "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        },
        {
          "id": "0xee60ff1f555bb052a0b624b9988855e6f8e368437911b42dfa3c18678e3dc91a",
          "blockHeight": null,
          "owner": "0xCBF177f46913069f6315219f243Dc14a21605fC8",
          "spender": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
          "value": "100000000000000000",
          "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        },
        {
          "id": "0x0106161b9235f16a703b639eb241849076b72c6580d220d781098dea3912a090",
          "blockHeight": null,
          "owner": "0xCBF177f46913069f6315219f243Dc14a21605fC8",
          "spender": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
          "value": "100000000000000000",
          "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        },
        {
          "id": "0x8a4da688ce5f82a8f5f4c6f50e09299e074e8aea6fb075d4a5c198aa649c8b91",
          "blockHeight": null,
          "owner": "0xCBF177f46913069f6315219f243Dc14a21605fC8",
          "spender": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
          "value": "100000000000000000",
          "contractAddress": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
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
