import {BasicAuth, QueryData, Trino} from '../../src';

let trino: Trino;
const allCustomerQuery = 'select * from customer';
const limit = 1;
const singleCustomerQuery = `select * from customer limit ${limit}`;
const useSchemaQuery = 'use tpcds.sf100000';

beforeEach(() => {
  trino = new Trino({
    catalog: 'tpcds',
    schema: 'sf100000',
    auth: new BasicAuth('test'),
  });
});

describe('trino', () => {
  test('exhaust query results', async () => {
    const query = await trino.query(singleCustomerQuery);
    const data = await query.fold<QueryData[]>([], (row, acc) => [
      ...acc,
      ...(row.data ?? []),
    ]);

    expect(data).toHaveLength(limit);
  });

  test('close running query', async () => {
    const query = await trino.query(allCustomerQuery);
    const qr = await query.next();
    await query.close();

    const info = await trino.queryInfo(qr.id);

    expect(info.state).toBe('FAILED');
  });

  test('cancel running query', async () => {
    const query = await trino.query(allCustomerQuery);
    const qr = await query.next();

    await trino.cancel(qr.id);
    const info = await trino.queryInfo(qr.id);

    expect(info.state).toBe('FAILED');
  });

  test('get query info', async () => {
    const query = await trino.query(singleCustomerQuery);
    const qr = await query.next();
    await query.close();

    const info = await trino.queryInfo(qr.id);
    expect(info.state).toBe('FINISHED');
    expect(info.query).toBe(singleCustomerQuery);
  });

  test('query request header propagation', async () => {
    trino = new Trino({catalog: 'tpcds', auth: new BasicAuth('test')});
    const query = await trino.query(useSchemaQuery);
    await query.next();
    await query.close();

    const sqr = await trino.query(singleCustomerQuery);
    const qr = await sqr.next();
    await sqr.close();

    const info = await trino.queryInfo(qr.id);
    expect(info.state).toBe('FINISHED');
    expect(info.query).toBe(singleCustomerQuery);
  });
});
