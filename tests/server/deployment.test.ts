import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createServer, type Socket } from "node:net";
import {
  checkDeployment,
  type DeploymentEnvironment,
} from "../../src/server/deployment";
import { verifyDeploymentSMTP } from "../../scripts/deployment-services";

const fixture = (): Record<string, string> => ({
  BETTER_AUTH_URL: "https://app.fixture-domain.org",
  BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
  DOCUMENT_KEY: randomBytes(32).toString("hex"),
  DATABASE_URL:
    "postgresql://fixture:private-test-password@db.fixture-domain.org/postgres?sslmode=verify-full",
  DATABASE_POOL_MAX: "2",
  SMTP_URL:
    "smtp://fixture:private-mail-password@mail.fixture-domain.org:587?requireTLS=true",
  MAIL_FROM: "Fixture <sender@fixture-domain.org>",
  ENABLE_DEMO: "false",
});
const errors = (env: DeploymentEnvironment) =>
  checkDeployment(env)
    .filter((c) => c.status === "error")
    .map((c) => c.name);

test("configuração aceita TLS direto ou STARTTLS obrigatório e mantém avisos de revisão", () => {
  const env = fixture();
  assert.deepEqual(errors(env), []);
  assert.deepEqual(
    errors({
      ...env,
      SMTP_URL:
        "smtps://fixture:private-mail-password@mail.fixture-domain.org:465",
    }),
    [],
  );
  assert.ok(
    checkDeployment(env).some(
      (c) => c.name === "TRUSTED_IP_HEADER" && c.status === "warning",
    ),
  );
  assert.ok(
    checkDeployment({ ...env, TRUSTED_IP_HEADER: "x-client-ip" }).some(
      (c) => c.name === "Revisão externa" && c.status === "warning",
    ),
  );
});

test("origem local, caminhos e credenciais na origem são recusados", () => {
  for (const origin of [
    "http://app.fixture-domain.org",
    "https://localhost",
    "https://127.1",
    "https://[::ffff:127.0.0.1]",
    "https://2130706433",
    "https://app.localhost",
    "https://app.fixture-domain.org/path",
    "https://app.fixture-domain.org?secret=fixture",
    "https://user:pass@app.fixture-domain.org",
  ]) {
    assert.ok(
      errors({ ...fixture(), BETTER_AUTH_URL: origin }).includes(
        "BETTER_AUTH_URL",
      ),
    );
  }
});

test("opções duplicadas e overrides de TLS/host não passam pela validação", () => {
  for (const query of [
    "",
    "?sslmode=require",
    "?sslmode=disable",
    "?sslmode=no-verify",
    "?sslmode=verify-full&sslmode=disable",
    "?sslmode=verify-full&ssl=false",
    "?sslmode=verify-full&host=localhost",
  ]) {
    assert.ok(
      errors({
        ...fixture(),
        DATABASE_URL: `postgresql://fixture:private@db.fixture-domain.org/postgres${query}`,
      }).includes("DATABASE_URL"),
    );
  }
  for (const url of [
    "smtp://fixture:private@mail.fixture-domain.org:587",
    "smtp://fixture:private@mail.fixture-domain.org:587?requireTLS=true&requireTLS=false",
    "smtps://fixture:private@mail.fixture-domain.org:465?tls.rejectUnauthorized=false",
    "smtps://fixture:private@mail.fixture-domain.org:465?streamTransport=true",
    "smtp://localhost:1025?requireTLS=true",
  ]) {
    assert.ok(errors({ ...fixture(), SMTP_URL: url }).includes("SMTP_URL"));
  }
});

test("segredos malformados, remetente inválido e modo de demonstração são recusados sem vazamento", () => {
  const env = fixture();
  const report = checkDeployment({
    ...env,
    DOCUMENT_KEY: `${env.DOCUMENT_KEY}bad`,
    BETTER_AUTH_SECRET: "x".repeat(64),
    ENABLE_DEMO: "true",
    APP_MODE: "prototype",
    NODE_TLS_REJECT_UNAUTHORIZED: "0",
    DATABASE_POOL_MAX: "13",
    MAIL_FROM:
      "Name <sender@fixture-domain.org\r\nBcc: secret@fixture-domain.org>",
  });
  for (const name of [
    "DOCUMENT_KEY",
    "BETTER_AUTH_SECRET",
    "ENABLE_DEMO",
    "APP_MODE",
    "TLS",
    "DATABASE_POOL_MAX",
    "MAIL_FROM",
  ])
    assert.ok(
      report.some((c) => c.name === name && c.status === "error"),
      name,
    );
  const output = JSON.stringify(report);
  for (const name of ["DATABASE_URL", "DOCUMENT_KEY", "SMTP_URL"])
    assert.equal(output.includes(env[name]), false);
  assert.ok(
    errors({ ...env, MAIL_FROM: "Name <sender@fixture-domain.org" }).includes(
      "MAIL_FROM",
    ),
  );
});

test("CLI valida configuração sem conexão e bloqueia configuração incompleta antes de --connect", () => {
  const values = fixture();
  const env = {
    ...process.env,
    ...values,
    APP_MODE: "live",
    NODE_TLS_REJECT_UNAUTHORIZED: "1",
  };
  const cli = ["--import=tsx", "scripts/check-deployment.ts"];
  const valid = spawnSync(process.execPath, cli, { env, encoding: "utf8" });
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /ainda não foram verificados/);
  const denied = spawnSync(process.execPath, [...cli, "--connect"], {
    env: { ...env, DATABASE_URL: "" },
    encoding: "utf8",
  });
  assert.equal(denied.status, 1);
  assert.match(denied.stderr, /Nenhuma conexão externa foi tentada/);
  for (const result of [valid, denied]) {
    const output = result.stdout + result.stderr;
    for (const name of [
      "SMTP_URL",
      "BETTER_AUTH_SECRET",
      "DOCUMENT_KEY",
    ] as const)
      assert.equal(output.includes(values[name]), false, name);
    assert.equal(output.includes("private-test-password"), false);
    assert.equal(output.includes("private-mail-password"), false);
  }
});

test("SMTP com requireTLS não autentica em servidor que recusa STARTTLS", async () => {
  const commands: string[] = [];
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.write("220 fixture SMTP\r\n");
    let buffer = "";
    socket.on("data", (data) => {
      buffer += data.toString();
      let newline;
      while ((newline = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 2);
        commands.push(line.split(" ")[0]);
        if (line.startsWith("EHLO"))
          socket.write("250-fixture\r\n250 AUTH PLAIN\r\n");
        else if (line === "STARTTLS") socket.write("454 TLS unavailable\r\n");
        else if (line === "QUIT") socket.end("221 bye\r\n");
        else socket.write("500 unsupported\r\n");
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  try {
    await assert.rejects(
      verifyDeploymentSMTP(
        `smtp://fixture:private-password@127.0.0.1:${port}?requireTLS=true`,
      ),
    );
    assert.ok(commands.includes("STARTTLS"));
    assert.equal(commands.includes("AUTH"), false);
    assert.equal(commands.includes("MAIL"), false);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
