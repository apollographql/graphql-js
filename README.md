# GraphQL.js

A JavaScript implementation of GraphQL, a query language for APIs created by Facebook.

[![Build Status](https://dev.azure.com/apollographql/graphql-js/_apis/build/status/apollographql.graphql-js?branchName=master)](https://dev.azure.com/apollographql/graphql-js/_build/latest?definitionId=2&branchName=master)
[![npm version](https://badge.fury.io/js/%40apollo%2Fgraphql.svg)](https://badge.fury.io/js/%40apollo%2Fgraphql)

The purpose of this fork is to increase the velocity with which we at Apollo are able to improve the `graphql` implementation, while also gradually converting it from Flow to TypeScript.

See more complete documentation at https://graphql.org/ and
https://graphql.org/graphql-js/.

Looking for help? Find resources [from the community](https://graphql.org/community/).

## Getting Started

An overview of GraphQL in general is available in the
[README](https://github.com/graphql/graphql-spec/blob/master/README.md) for the
[Specification for GraphQL](https://github.com/graphql/graphql-spec). That overview
describes a simple set of GraphQL examples that exist as [tests](src/__tests__)
in this repository. A good way to get started with this repository is to walk
through that README and the corresponding tests in parallel.

### Using GraphQL.js

Install GraphQL.js from npm

```sh
npm install --save @apollo/graphql
```

GraphQL.js provides two important capabilities: building a type schema, and
serving queries against that type schema.

First, build a GraphQL type schema which maps to your code base.

```js
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from '@apollo/graphql';

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
    },
  }),
});
```

This defines a simple schema with one type and one field, that resolves
to a fixed value. The `resolve` function can return a value, a promise,
or an array of promises. A more complex example is included in the top
level [tests](src/__tests__) directory.

Then, serve the result of a query against that type schema.

```js
var query = '{ hello }';

graphql(schema, query).then(result => {
  // Prints
  // {
  //   data: { hello: "world" }
  // }
  console.log(result);
});
```

This runs a query fetching the one field defined. The `graphql` function will
first ensure the query is syntactically and semantically valid before executing
it, reporting errors otherwise.

```js
var query = '{ boyhowdy }';

graphql(schema, query).then(result => {
  // Prints
  // {
  //   errors: [
  //     { message: 'Cannot query field boyhowdy on RootQueryType',
  //       locations: [ { line: 1, column: 3 } ] }
  //   ]
  // }
  console.log(result);
});
```

### Using in a Browser

GraphQL.js is a general purpose library and can be used both in a Node server
and in the browser. As an example, the [GraphiQL](https://github.com/graphql/graphiql/)
tool is built with GraphQL.js!

Building a project using GraphQL.js with [webpack](https://webpack.js.org) or
[rollup](https://github.com/rollup/rollup) should just work and only include
the portions of the library you use. This works because GraphQL.js is distributed
with both CommonJS (`require()`) and ESModule (`import`) files. Ensure that any
custom build configurations look for `.mjs` files!

### Contributing

[Read the Apollo Contributor Guidelines.](https://github.com/apollographql/graphql-js/blob/master/.github/CONTRIBUTING.md)

### Changelog

Changes are tracked as [GitHub releases](https://github.com/graphql/graphql-js/releases).

### License

GraphQL.js is [MIT-licensed](https://github.com/graphql/graphql-js/blob/master/LICENSE).

## TypeScript definition files

We used `*.d.ts` files from [DefinetlyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/54712a7e28090c5b1253b746d1878003c954f3ff/types/graphql) as the basis for our TypeScript conversion in `v15.0.0`. Big thanks to:

- TonyYang https://github.com/TonyPythoneer
- Caleb Meredith https://github.com/calebmer
- Dominic Watson https://github.com/intellix
- Firede https://github.com/firede
- Kepennar https://github.com/kepennar
- Mikhail Novikov https://github.com/freiksenet
- Ivan Goncharov https://github.com/IvanGoncharov
- Hagai Cohen https://github.com/DxCx
- Ricardo Portugal https://github.com/rportugal
- Tim Griesser https://github.com/tgriesser
- Dylan Stewart https://github.com/dyst5422
- Alessio Dionisi https://github.com/adnsio
- Divyendu Singh https://github.com/divyenduz
- Brad Zacher https://github.com/bradzacher
- Curtis Layne https://github.com/clayne11
- Jonathan Cardoso https://github.com/JCMais
- Pavel Lang https://github.com/langpavel
- Mark Caudill https://github.com/mc0
- Martijn Walraven https://github.com/martijnwalraven
- Jed Mao https://github.com/jedmao
