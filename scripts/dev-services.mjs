import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const local = resolve(root, ".local");
const dockerCandidates = [
  "docker",
  ...(process.platform === "win32"
    ? [
        process.env.LOCALAPPDATA &&
          join(
            process.env.LOCALAPPDATA,
            "Programs",
            "DockerDesktop",
            "resources",
            "bin",
            "docker.exe",
          ),
        process.env.ProgramFiles &&
          join(
            process.env.ProgramFiles,
            "Docker",
            "Docker",
            "resources",
            "bin",
            "docker.exe",
          ),
      ].filter(Boolean)
    : []),
];
const docker = dockerCandidates.find(
  (command) =>
    spawnSync(command, ["--version"], { stdio: "ignore", windowsHide: true })
      .status === 0,
);
if (!docker)
  throw new Error(
    "Docker não encontrado. Instale o Docker Desktop e abra-o antes de executar npm run services.",
  );
const run = (args, options = {}) =>
  execFileSync(docker, args, {
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
try {
  run(["info", "--format", "{{.ServerVersion}}"], { stdio: "ignore" });
} catch {
  throw new Error(
    "O motor do Docker não está disponível. Abra o Docker Desktop e aguarde Engine running.",
  );
}
const containerNames = run(["ps", "-a", "--format", "{{.Names}}"])
  .trim()
  .split(/\r?\n/);
if (
  containerNames.includes("conecta-sintedorp-db") &&
  (!existsSync(resolve(root, ".env.local")) ||
    !existsSync(resolve(local, "services.json")))
) {
  throw new Error(
    "Já existe um banco local deste projeto. Recupere a configuração privada .env.local e .local da instalação existente antes de continuar. O banco foi preservado.",
  );
}
mkdirSync(local, { recursive: true, mode: 0o700 });
const configFile = resolve(local, "services.json");
let config;
if (existsSync(configFile))
  config = JSON.parse(readFileSync(configFile, "utf8"));
else {
  config = {
    password: randomBytes(32).toString("hex"),
    authSecret: randomBytes(48).toString("base64url"),
    documentKey: randomBytes(32).toString("hex"),
  };
  writeFileSync(configFile, JSON.stringify(config), {
    mode: 0o600,
    flag: "wx",
  });
}
const envFile = resolve(root, ".env.local");
if (!existsSync(envFile))
  writeFileSync(
    envFile,
    [
      `DATABASE_URL=postgresql://sintedorp:${config.password}@127.0.0.1:5432/sintedorp`,
      `BETTER_AUTH_SECRET=${config.authSecret}`,
      "BETTER_AUTH_URL=http://localhost:3000",
      `DOCUMENT_KEY=${config.documentKey}`,
      "SMTP_URL=smtp://127.0.0.1:1025",
      "MAIL_FROM=Conecta SINTEDORP <nao-responda@example.test>",
      "ENABLE_DEMO=true",
      "SITE_POLICY_STATUS=draft",
      "",
    ].join("\n"),
    { mode: 0o600, flag: "wx" },
  );

const pgImage =
  "postgres@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826";
const mailImage =
  "axllent/mailpit@sha256:b1f1be18af530d939a11ee8820b379e0c88eeec204d904bfad68862adced3a5a";
const state =
  process.platform === "win32"
    ? resolve(local, "postgres-data")
    : resolve("/workspace/.state/sintedorp");
mkdirSync(resolve(state, "postgres"), { recursive: true });
const pgEnv = resolve(local, "postgres.env");
if (!existsSync(pgEnv))
  writeFileSync(
    pgEnv,
    `POSTGRES_USER=sintedorp\nPOSTGRES_PASSWORD=${config.password}\nPOSTGRES_DB=sintedorp\n`,
    { mode: 0o600, flag: "wx" },
  );
function start(name, args) {
  const names = run(["ps", "-a", "--format", "{{.Names}}"]);
  if (names.trim().split(/\r?\n/).includes(name))
    run(["start", name], { stdio: "ignore" });
  else run(["run", "--detach", "--name", name, ...args], { stdio: "ignore" });
}
start("conecta-sintedorp-db", [
  "--publish",
  "127.0.0.1:5432:5432",
  "--env-file",
  pgEnv,
  "--mount",
  `type=bind,source=${resolve(state, "postgres")},target=/var/lib/postgresql/data`,
  pgImage,
]);
start("conecta-sintedorp-mail", [
  "--publish",
  "127.0.0.1:1025:1025",
  "--publish",
  "127.0.0.1:8025:8025",
  mailImage,
]);
let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    run(["exec", "conecta-sintedorp-db", "pg_isready", "-U", "sintedorp"], {
      stdio: "ignore",
    });
    ready = true;
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}
if (!ready)
  throw new Error(
    "PostgreSQL não ficou pronto. Inspecione somente os logs do container deste projeto.",
  );
console.log(
  "PostgreSQL e caixa de e-mail locais prontos. Configuração privada preservada; nenhum segredo exibido.",
);
