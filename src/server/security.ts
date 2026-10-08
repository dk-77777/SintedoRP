import { getAuth } from "./auth";
import { rows, transaction } from "./db";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type Actor = { id: string; name: string; role: string; roles: string[] };
export async function actorFor(headers: Headers): Promise<Actor> {
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user.emailVerified)
    throw new HttpError(401, "Entre com um e-mail confirmado para continuar.");
  if (session.user.suspended)
    throw new HttpError(
      403,
      "Conta suspensa. Entre em contato com o sindicato.",
    );
  const grants = await rows<{ role: string }>(
    "SELECT role FROM role_grant WHERE user_id=$1",
    [session.user.id],
  );
  const roles = grants.map((g) => g.role);
  const selected = session.user.currentRole;
  const role = (
    selected === "sindicato"
      ? roles.some((r) => ["ADMIN", "MODERATOR", "ANALYST"].includes(r))
      : roles.includes(selected)
  )
    ? selected
    : roles.includes("trabalhador")
      ? "trabalhador"
      : roles.includes("empregador")
        ? "empregador"
        : roles.some((r) => ["ADMIN", "MODERATOR", "ANALYST"].includes(r))
          ? "sindicato"
          : "trabalhador";
  return {
    id: session.user.id,
    name: session.user.name,
    role,
    roles,
  };
}
export function requireRole(actor: Actor, roles: string[]) {
  if (!roles.some((role) => actor.roles.includes(role)))
    throw new HttpError(403, "Seu perfil não tem acesso a esta ação.");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.BETTER_AUTH_URL;
  if (!expected || origin !== new URL(expected).origin)
    throw new HttpError(403, "Origem da solicitação inválida.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "Use conteúdo JSON.");
}
export async function boundedBody(request: Request, max = 16000) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Solicitação vazia.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > max) {
      await reader.cancel();
      throw new HttpError(413, "Solicitação muito grande.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export async function throttle(actor: Actor) {
  await transaction(async (client) => {
    const [result] = await rows<{ count: number }>(
      `INSERT INTO action_throttle(key,count,window_start) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN action_throttle.window_start<now()-interval '1 minute' THEN 1 ELSE action_throttle.count+1 END,
      window_start=CASE WHEN action_throttle.window_start<now()-interval '1 minute' THEN now() ELSE action_throttle.window_start END RETURNING count`,
      [actor.id],
      client,
    );
    if (result.count > 60)
      throw new HttpError(429, "Aguarde um minuto antes de tentar novamente.");
  });
}
