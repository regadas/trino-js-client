# trino-js-client

A [Trino](https://trino.io) client for [Node.js](https://nodejs.org/).

## Features

- Connections over HTTP or HTTPS
- Supports HTTP Basic Authentication
- Per-query user information for access control

## Requirements

- Node 12 or newer.
- Trino 0.16x or newer.

## Install

`npm install trino-client` or `yarn add trino-client`

## Usage

```typescript
const trino = new Trino({
  server: 'http://localhost:8080'
  catalog: 'tpcds',
  schema: 'sf100000',
  auth: new BasicAuth('test'),
});

const queryIter = await trino.query('select * from customer limit 100');
const data = await queryIter.fold<QueryData[]>([], (row, acc) => [
  ...acc,
  ...(row.data ?? []),
]);
```

More usage [examples](./tests/it/client.spec.ts) can be found in the [integration tests](./tests/it/client.spec.ts).

Filipe Regadas (regadas) 2022