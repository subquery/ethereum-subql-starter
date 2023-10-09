# SubQuery - Starter Package

This project indexes all Crabada NFTs on Avalanche's C-chain

## Preparation

#### Environment

- [Typescript](https://www.typescriptlang.org/) are required to compile project and define types.

- Both SubQuery CLI and generated Project have dependencies and require [Node](https://nodejs.org/en/).

#### Install the SubQuery CLI

Install SubQuery CLI globally on your terminal by using NPM:

```
npm install -g @subql/cli
```

Run help to see available commands and usage provide by CLI

```
subql help
```

## Initialize the starter package

Inside the directory in which you want to create the SubQuery project, simply replace `project-name` with your project name and run the command:

```
subql init --starter project-name
```

Then you should see a folder with your project name has been created inside the directory, you can use this as the start point of your project. And the files should be identical as in the [Directory Structure](https://doc.subquery.network/directory_structure.html).

Last, under the project directory, run following command to install all the dependency.

```
yarn install
```

## Configure your project

In the starter package, we have provided a simple example of project configuration. You will be mainly working on the following files:

- The Manifest in `project.yaml`
- The GraphQL Schema in `schema.graphql`
- The Mapping functions in `src/mappings/` directory

For more information on how to write the SubQuery,
check out our doc section on [Define the SubQuery](https://doc.subquery.network/define_a_subquery.html)

## Run the Project

`yarn dev`

## Query the project

Open your browser and head to `http://localhost:3000`.

Finally, you should see a GraphQL playground is showing in the explorer and the schemas that ready to query.

For the `subql-starter` project, you can try to query with the following code to get a taste of how it works.

```graphql
query {
  crabs(first: 5, orderBy: TRANSFERS_COUNT_DESC) {
    totalCount
    nodes {
      id
      addressId
      daddyId
      mommyId
      dna
      birthday
      breedingCount
      mintedBlock
      mintedTimestamp
      currentOwnerId
      minterAddressId
      metadataUrl
      transfers(first: 5, orderBy: BLOCK_DESC) {
        totalCount
        nodes {
          transactionHash
          block
        }
      }
    }
  }
}
```
