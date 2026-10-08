import { readState } from "@/server/state";
import { HttpError } from "@/server/security";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    return Response.json(await readState(request.headers), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof HttpError
            ? error.message
            : "Não foi possível carregar os dados.",
      },
      { status: error instanceof HttpError ? error.status : 500 },
    );
  }
}
