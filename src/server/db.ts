import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalDb = globalThis as unknown as { dbPool?: Pool };
const poolMax = Number(process.env.DATABASE_POOL_MAX ?? "12");
if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 12)
  throw new Error("DATABASE_POOL_MAX deve ser um inteiro entre 1 e 12.");
export const pool =
  globalDb.dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
    connectionTimeoutMillis: 5000,
  });
if (process.env.NODE_ENV !== "production") globalDb.dbPool = pool;
pool.on("error", () => {
  console.error("Conexão ociosa com o banco foi encerrada.");
});
export async function rows<T extends QueryResultRow = Record<string, unknown>>(
  sql: string,
  values: unknown[] = [],
  client: Pool | PoolClient = pool,
): Promise<T[]> {
  return (await client.query<T>(sql, values)).rows;
}
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
