import { commandSchema, execute } from "@/server/domain";
import {
  actorFor,
  HttpError,
  sameOrigin,
  throttle,
  boundedBody,
} from "@/server/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const actor = await actorFor(request.headers);
    await throttle(actor);
    const raw = await boundedBody(request);
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "JSON inválido.");
    }
    const input = commandSchema.safeParse(json);
    if (!input.success)
      throw new HttpError(
        400,
        input.error.issues[0]?.message ?? "Confira os campos informados.",
      );
    return Response.json(await execute(actor, input.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof HttpError)
      return Response.json({ error: error.message }, { status: error.status });
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    )
      return Response.json(
        { error: "Este cadastro ou registro já existe." },
        { status: 409 },
      );
    console.error(
      "Falha na ação",
      error instanceof Error ? error.name : "erro desconhecido",
    );
    return Response.json(
      { error: "Não foi possível concluir a ação. Tente novamente." },
      { status: 500 },
    );
  }
}
