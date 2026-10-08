import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const localEnv = resolve(import.meta.dirname, "../.env.local");
if (existsSync(localEnv)) process.loadEnvFile(localEnv);
const args = process.argv.slice(2);
const port = args.includes("--port")
  ? args[args.indexOf("--port") + 1]
  : (process.env.PORT ?? "3000");
const hostname = args.includes("--hostname")
  ? args[args.indexOf("--hostname") + 1]
  : "0.0.0.0";
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)
  throw new Error("Porta inválida.");
process.env.PORT = port;
process.env.HOSTNAME = hostname;
const output = resolve(import.meta.dirname, "../.next/standalone");
if (!existsSync(resolve(output, "server.js")))
  throw new Error("Execute npm run build antes de iniciar.");
cpSync(resolve(output, "../static"), resolve(output, ".next/static"), {
  recursive: true,
});
await import(pathToFileURL(resolve(output, "server.js")).href);
