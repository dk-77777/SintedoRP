import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const privateDir = resolve(root, ".local");
mkdirSync(privateDir, { recursive: true, mode: 0o700 });
const templates = [
  [
    "production.env",
    readFileSync(resolve(root, ".env.production.example"), "utf8"),
  ],
  [
    "migration.env",
    "# Conexão direta ou pooler em modo de sessão. Não use pooler de transação.\nDATABASE_URL=\n",
  ],
];
for (const [name, content] of templates) {
  try {
    writeFileSync(resolve(privateDir, name), content, {
      flag: "wx",
      mode: 0o600,
    });
    console.log(`Preparado .local/${name}: modelo privado sem credenciais.`);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log(
      `Preservado .local/${name}: arquivo existente não foi alterado.`,
    );
  }
}
console.log(
  "Preencha os valores pelos mecanismos seguros. Esta preparação não cria projetos nem tenta conexão externa.",
);
