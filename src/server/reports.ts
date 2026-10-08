import { z } from "zod";
import { rows } from "./db";
import { requireRole, HttpError, type Actor } from "./security";
import type { ReportRow } from "../live/types";
export async function report(
  actor: Actor,
  from: string,
  to: string,
): Promise<ReportRow[]> {
  requireRole(actor, ["ADMIN", "MODERATOR", "ANALYST"]);
  if (
    !z.iso.date().safeParse(from).success ||
    !z.iso.date().safeParse(to).success ||
    from > to
  )
    throw new HttpError(400, "Período inválido.");
  const start = `${from} 00:00:00 America/Sao_Paulo`;
  const end = `${to} 00:00:00 America/Sao_Paulo`;
  return rows<ReportRow>(
    `SELECT e.id employer_id,e.name,e.type,e.region,e.verified,
    (SELECT count(*)::int FROM moderation m JOIN job_revision r ON r.id=m.revision_id JOIN job j ON j.id=r.job_id WHERE j.employer_id=e.id AND m.decision='Publicada' AND m.created_at >= $1::timestamptz AND m.created_at < $2::timestamptz+interval '1 day') published,
    (SELECT count(*)::int FROM application a JOIN job j ON j.id=a.job_id WHERE j.employer_id=e.id AND a.created_at >= $1::timestamptz AND a.created_at < $2::timestamptz+interval '1 day') applications,
    (SELECT count(*)::int FROM application_event a JOIN application p ON p.id=a.application_id JOIN job j ON j.id=p.job_id WHERE j.employer_id=e.id AND a.status='Contratação informada' AND a.created_at >= $1::timestamptz AND a.created_at < $2::timestamptz+interval '1 day') hires,
    (SELECT count(*)::int FROM experience x WHERE x.employer_id=e.id AND NOT x.contested AND x.confirmed_at >= $1::timestamptz AND x.confirmed_at < $2::timestamptz+interval '1 day') confirmed,
    (SELECT count(*)::int FROM review r JOIN experience x ON x.id=r.experience_id WHERE x.employer_id=e.id AND r.status='Publicada' AND r.created_at >= $1::timestamptz AND r.created_at < $2::timestamptz+interval '1 day') reviews,
    (SELECT avg(r.rating)::float FROM review r JOIN experience x ON x.id=r.experience_id WHERE x.employer_id=e.id AND r.status='Publicada' AND r.created_at >= $1::timestamptz AND r.created_at < $2::timestamptz+interval '1 day') average
    FROM employer e ORDER BY e.name`,
    [start, end],
  );
}
export function csvCell(value: unknown) {
  let string = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(string)) string = "'" + string;
  return `"${string.replaceAll('"', '""')}"`;
}
export function reportCSV(items: ReportRow[]) {
  return (
    "\uFEFF" +
    [
      [
        "Empregador",
        "Tipo",
        "Região",
        "Verificado manualmente",
        "Publicações de revisões",
        "Candidaturas",
        "Contratações informadas",
        "Experiências confirmadas",
        "Avaliações publicadas",
        "Média",
      ],
      ...items.map((r) => [
        r.name,
        r.type,
        r.region,
        r.verified ? "Sim" : "Não",
        r.published,
        r.applications,
        r.hires,
        r.confirmed,
        r.reviews,
        r.average?.toFixed(2) ?? "",
      ]),
    ]
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n")
  );
}
