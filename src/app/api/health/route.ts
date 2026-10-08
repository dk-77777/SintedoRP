import { rows } from "@/server/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [check] = await rows<{ count: number }>(
      "SELECT count(*)::int count FROM schema_migration WHERE name IN ('001-auth.sql','002-domain.sql','003-consent.sql','004-experience-closure.sql')",
    );
    if (check.count !== 4) throw new Error("Migrações pendentes");
    return Response.json(
      { status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
