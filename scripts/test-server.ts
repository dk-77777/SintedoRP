import { spawn, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { Pool } from "pg";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const source = new URL(process.env.DATABASE_URL!);
if (!["127.0.0.1", "localhost"].includes(source.hostname))
  throw new Error("Os testes exigem PostgreSQL local, separado de produção.");
const database = `sintedorp_e2e_${randomBytes(8).toString("hex")}`;
const admin = new Pool({ connectionString: source.toString() });
await admin.query(`CREATE DATABASE "${database}"`);
source.pathname = `/${database}`;
process.env.DATABASE_URL = source.toString();
process.env.BETTER_AUTH_URL = "http://localhost:3100";
process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64url");
process.env.DOCUMENT_KEY = randomBytes(32).toString("hex");
process.env.ENABLE_DEMO = "true";
process.env.APP_MODE = "live";
const fixture = ".local/e2e-env.json";
let server: ReturnType<typeof spawn> | undefined;
let cleaning = false;
async function cleanup(code = 0) {
  if (cleaning) return;
  cleaning = true;
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      server!.once("exit", () => resolve());
      setTimeout(resolve, 5000).unref();
    });
  }
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
  } finally {
    await admin.end();
    if (existsSync(fixture)) unlinkSync(fixture);
  }
  process.exit(code);
}
try {
  execFileSync(
    "node",
    ["node_modules/tsx/dist/cli.mjs", "scripts/migrate.ts"],
    { env: process.env, stdio: "pipe" },
  );
  writeFileSync(fixture, JSON.stringify({ databaseURL: source.toString() }), {
    mode: 0o600,
  });
  server = spawn(
    "node",
    ["scripts/start.mjs", "--hostname", "127.0.0.1", "--port", "3100"],
    { env: process.env, stdio: "inherit" },
  );
  server.once("exit", (code) => {
    void cleanup(code ?? 1);
  });
  process.once("SIGTERM", () => {
    void cleanup();
  });
  process.once("SIGINT", () => {
    void cleanup();
  });
} catch (error) {
  console.error("Falha na preparação do servidor de teste.");
  await cleanup(1);
}
