import { checkDeployment } from "../src/server/deployment";
import {
  verifyDeploymentDatabase,
  verifyDeploymentSMTP,
} from "./deployment-services";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--connect") || args.length > 1) {
  console.error("Uso: npm run deploy:check -- [--connect]");
  process.exitCode = 2;
} else {
  // No automatic .env.local loading: production checks use explicitly injected values.
  const checks = checkDeployment(process.env);
  for (const item of checks)
    console.log(`[${item.status.toUpperCase()}] ${item.name}: ${item.message}`);
  if (checks.some((item) => item.status === "error")) {
    console.error(
      "Configuração de implantação incompleta. Nenhuma conexão externa foi tentada; nenhum valor de configuração foi exibido.",
    );
    process.exitCode = 1;
  } else if (!args.includes("--connect")) {
    console.log(
      "Configuração estática válida. Banco, SMTP e domínio ainda não foram verificados. Use --connect após preparar os serviços.",
    );
  } else {
    const results = await Promise.allSettled([
      verifyDeploymentDatabase(process.env.DATABASE_URL!),
      verifyDeploymentSMTP(process.env.SMTP_URL!),
    ]);
    for (const [index, result] of results.entries()) {
      const name =
        index === 0
          ? "PostgreSQL e checksums das migrações"
          : "Conexão/autenticação SMTP sem envio";
      console.log(
        `[${result.status === "fulfilled" ? "OK" : "ERROR"}] ${name}: ${result.status === "fulfilled" ? "Verificado." : "Falhou. Confira rede, TLS, credenciais e configuração no provedor."}`,
      );
    }
    if (results.some((result) => result.status === "rejected"))
      process.exitCode = 1;
    else
      console.log(
        "Serviços verificados. Entrega de e-mail, fluxo no domínio final e definições institucionais continuam exigindo validação própria.",
      );
  }
}
