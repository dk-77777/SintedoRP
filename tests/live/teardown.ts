import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { Pool } from "pg";
export default async function teardown() {
  const file = ".local/e2e-env.json";
  if (!existsSync(file)) return;
  const fixture = JSON.parse(readFileSync(file, "utf8"));
  const url = new URL(fixture.databaseURL);
  const database = url.pathname.slice(1);
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    !/^sintedorp_e2e_[a-f0-9]{16}$/.test(database)
  )
    throw new Error(
      "Limpeza recusada: banco não identificado como teste local.",
    );
  url.pathname = "/sintedorp";
  const db = new Pool({ connectionString: url.toString() });
  try {
    await db.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    unlinkSync(file);
  } finally {
    await db.end();
  }
}
