export type DeploymentCheck = {
  name: string;
  status: "ok" | "error" | "warning";
  message: string;
};
export type DeploymentEnvironment = Readonly<
  Record<string, string | undefined>
>;

function remoteHost(host: string) {
  let value = host.toLowerCase().replace(/\.$/, "");
  try {
    value = new URL(`http://${value}`).hostname;
  } catch {
    return false;
  }
  return (
    !!value &&
    !/^(localhost|127(?:\.\d+){3}|\[::1\]|\[::\]|\[::ffff:7f[\da-f]{2}:[\da-f]+\]|0\.0\.0\.0)$/.test(
      value,
    ) &&
    !/\.(localhost|test|invalid|example)$/.test(value)
  );
}

function parsedURL(value: string | undefined): URL | undefined {
  if (!value || value !== value.trim()) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

function supportedQuery(url: URL, names: string[]) {
  const seen = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (seen.has(key) || !names.includes(key)) return false;
    seen.add(key);
  }
  return true;
}

/** Returns fixed messages only. Configuration values must never enter this report. */
export function checkDeployment(env: DeploymentEnvironment): DeploymentCheck[] {
  const checks: DeploymentCheck[] = [];
  const check = (name: string, valid: boolean, message: string) =>
    checks.push({
      name,
      status: valid ? "ok" : "error",
      message: valid ? "Configuração estática válida." : message,
    });
  const origin = parsedURL(env.BETTER_AUTH_URL);
  check(
    "BETTER_AUTH_URL",
    !!origin &&
      origin.protocol === "https:" &&
      remoteHost(origin.hostname) &&
      !origin.username &&
      !origin.password &&
      origin.pathname === "/" &&
      !origin.search &&
      !origin.hash,
    "Defina a origem HTTPS final, sem credenciais, caminho, query ou fragmento.",
  );

  const secret = env.BETTER_AUTH_SECRET ?? "";
  check(
    "BETTER_AUTH_SECRET",
    secret === secret.trim() &&
      Buffer.byteLength(secret) >= 32 &&
      new Set(secret).size >= 8,
    "Use um segredo novo, aleatório, com pelo menos 32 bytes; não reutilize o segredo local.",
  );
  const documentKey = env.DOCUMENT_KEY ?? "";
  check(
    "DOCUMENT_KEY",
    /^[a-f\d]{64}$/i.test(documentKey) && !/^(.)\1+$/.test(documentKey),
    "Use uma chave aleatória de 32 bytes, em 64 caracteres hexadecimais.",
  );

  const db = parsedURL(env.DATABASE_URL);
  check(
    "DATABASE_URL",
    !!db &&
      ["postgres:", "postgresql:"].includes(db.protocol) &&
      remoteHost(db.hostname) &&
      !!db.username &&
      !!db.password &&
      db.pathname.length > 1 &&
      !db.hash &&
      supportedQuery(db, [
        "sslmode",
        "sslrootcert",
        "sslcert",
        "sslkey",
        "uselibpqcompat",
        "application_name",
        "connect_timeout",
      ]) &&
      db.searchParams.get("sslmode") === "verify-full",
    "Defina uma conexão PostgreSQL externa com banco, credenciais e sslmode=verify-full. Não use parâmetros duplicados ou overrides de host/TLS.",
  );

  const poolMax = env.DATABASE_POOL_MAX ?? "12";
  check(
    "DATABASE_POOL_MAX",
    /^\d+$/.test(poolMax) && Number(poolMax) >= 1 && Number(poolMax) <= 12,
    "Use um inteiro de 1 a 12; em serverless comece com 2 por instância.",
  );

  const smtp = parsedURL(env.SMTP_URL);
  check(
    "SMTP_URL",
    !!smtp &&
      ["smtp:", "smtps:"].includes(smtp.protocol) &&
      remoteHost(smtp.hostname) &&
      !!smtp.username &&
      !!smtp.password &&
      (!smtp.pathname || smtp.pathname === "/") &&
      !smtp.hash &&
      supportedQuery(smtp, ["requireTLS"]) &&
      (smtp.protocol === "smtps:" ||
        smtp.searchParams.get("requireTLS") === "true"),
    "Use SMTP autenticado: smtps com TLS direto ou smtp com ?requireTLS=true. Configurações que desativam TLS/certificados não são aceitas.",
  );

  const sender = env.MAIL_FROM ?? "";
  const mailbox =
    sender.match(/^([^<>\s,@]+@([^<>\s,@]+))$/) ??
    sender.match(/^[^<>\r\n]+\s<([^<>\s,@]+@([^<>\s,@]+))>$/);
  check(
    "MAIL_FROM",
    !!mailbox && remoteHost(mailbox[2]) && !/[\r\n]/.test(sender),
    "Defina um único remetente autorizado no provedor, fora dos domínios de teste.",
  );
  check(
    "ENABLE_DEMO",
    env.ENABLE_DEMO === "false",
    "Defina ENABLE_DEMO=false para a implantação externa.",
  );
  check(
    "APP_MODE",
    !env.APP_MODE || env.APP_MODE === "live",
    "Remova APP_MODE=prototype ou configure live.",
  );
  check(
    "TLS",
    env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
    "Remova a desativação global da validação de certificados TLS.",
  );
  const ip = env.TRUSTED_IP_HEADER;
  if (!ip)
    checks.push({
      name: "TRUSTED_IP_HEADER",
      status: "warning",
      message:
        "O limite de autenticação será compartilhado. Configure somente um cabeçalho comprovadamente substituído pelo proxy.",
    });
  else
    check(
      "TRUSTED_IP_HEADER",
      /^[a-z\d-]+$/i.test(ip),
      "Use um nome de cabeçalho válido, comprovadamente substituído pelo proxy.",
    );
  checks.push({
    name: "Revisão externa",
    status: "warning",
    message:
      "A checagem não confirma política institucional, remetente/domínio autorizado, acesso público bloqueado no Supabase ou elegibilidade dos planos.",
  });
  return checks;
}
