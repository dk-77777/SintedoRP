import { existsSync, writeFileSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { getAuth } = await import("../src/server/auth");
const { pool } = await import("../src/server/db");
const { getMigrations } = await import("better-auth/db/migration");
const target = process.argv[2];
if (
  !target ||
  !/^migrations\/[0-9]+-[a-z-]+\.sql$/.test(target) ||
  existsSync(target)
)
  throw new Error(
    "Informe um novo arquivo migrations/NNN-auth-update.sql; migrações existentes são imutáveis.",
  );
try {
  const migrations = await getMigrations(getAuth().options);
  writeFileSync(target, await migrations.compileMigrations(), { flag: "wx" });
  console.log("Esquema oficial do Better Auth gerado para revisão.");
} finally {
  await pool.end();
}
