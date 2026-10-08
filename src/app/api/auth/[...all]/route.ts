import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth";
import { boundedBody, HttpError } from "@/server/security";
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}
export async function POST(request: Request) {
  try {
    const body = await boundedBody(request);
    return toNextJsHandler(getAuth()).POST(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body,
      }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof HttpError ? error.message : "Solicitação inválida.",
      },
      { status: error instanceof HttpError ? error.status : 400 },
    );
  }
}
export const runtime = "nodejs";
