import { actorFor, HttpError } from "@/server/security";
import { report, reportCSV } from "@/server/reports";
export async function GET(request: Request) {
  try {
    const actor = await actorFor(request.headers);
    const url = new URL(request.url);
    const items = await report(
      actor,
      url.searchParams.get("from") ?? "",
      url.searchParams.get("to") ?? "",
    );
    if (url.searchParams.get("format") === "csv")
      return new Response(reportCSV(items), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=relatorio-empregadores.csv",
          "Cache-Control": "no-store",
        },
      });
    return Response.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof HttpError
            ? error.message
            : "Não foi possível gerar o relatório.",
      },
      { status: error instanceof HttpError ? error.status : 500 },
    );
  }
}
