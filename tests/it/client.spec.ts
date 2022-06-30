import {Trino} from '../../src';

describe('trino', () => {
  const trino = new Trino({
    catalog: 'tpcds',
    schema: 'sf100000',
    user: 'test',
  });
  const queryAll = 'select * from customer';
  const limit = 1;
  const query = `select * from customer limit ${limit}`;

  test('exhaust query results', async () => {
    const stmt = await trino.query(query);
    const data = await stmt.fold<any[]>([], (row, acc) => [
      ...acc,
      ...(row.data ?? []),
    ]);

    expect(data).toHaveLength(limit);
  });

  test('close running query', async () => {
    const stmt = await trino.query(queryAll);
    const qr = await stmt.next();
    await stmt.close();

    const info = await trino.queryInfo(qr.id);

    expect(info.state).toBe('FAILED');
  });

  test('cancel running query', async () => {
    const stmt = await trino.query(queryAll);
    const qr = await stmt.next();

    await trino.cancel(qr.id);
    const info = await trino.queryInfo(qr.id);

    expect(info.state).toBe('FAILED');
  });

  test('get query info', async () => {
    const stmt = await trino.query(query);
    const qr = await stmt.next();
    await stmt.close();

    const info = await trino.queryInfo(qr.id);
    expect(info.state).toBe('FINISHED');
    expect(info.query).toBe(query);
  });
});
