import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const origin = "http://127.0.0.1:3119";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3119",
  ],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk;
});
server.stderr.on("data", (chunk) => {
  output += chunk;
});
try {
  for (let attempt = 0; !output.includes("Ready in"); attempt++) {
    if (attempt > 80 || server.exitCode !== null)
      throw new Error("O servidor temporário não iniciou.");
    await wait(250);
  }
  const production = (await fetch(origin)).headers.get(
    "content-security-policy",
  );
  assert.ok(production, "CSP de produção presente");
  assert.equal(
    production.replace(/'nonce-[^']+'/g, "'nonce-TEST'"),
    "default-src 'self'; script-src 'self' 'nonce-TEST' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  );
  const development = (
    await fetch(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000")
  ).headers.get("content-security-policy");
  assert.match(development, /script-src [^;]*http:\/\/localhost:8400/);
  assert.match(development, /connect-src 'self' http:\/\/localhost:8400/);
  console.log(
    "CSP: helper permitido em desenvolvimento; produção idêntica à política anterior.",
  );
} finally {
  server.kill();
}
