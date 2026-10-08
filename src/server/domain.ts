import { z } from "zod";
import type { PoolClient } from "pg";
import { rows, transaction } from "./db";
import { HttpError, requireRole, type Actor } from "./security";
import { protectDocument, validCPF, validCNPJ } from "./documents";
import { validPastDate } from "../shared/calendar";

const text = (max = 300) => z.string().trim().min(1).max(max);
const id = z.uuid();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) => validPastDate(value),
    "Informe uma data válida, até hoje.",
  );
const jobFields = {
  title: text(100),
  category: z.enum([
    "Doméstica",
    "Diarista",
    "Babá",
    "Cuidador de idosos",
    "Cozinheiro",
    "Jardineiro",
    "Outro",
  ]),
  region: text(100),
  salaryCents: z.number().int().min(1).max(100_000_000),
  period: z.enum(["Mês", "Dia", "Hora"]),
  schedule: text(160),
  hours: text(160),
  description: text(4000),
  benefits: z.string().trim().max(1500),
  acceptedTerms: z.literal(true),
};
export const commandSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("updateProfile"),
      name: text(100),
      region: text(100),
      category: text(100),
      availability: text(160),
      bio: z.string().trim().max(1500),
    })
    .strict(),
  z
    .object({
      action: z.literal("profile"),
      kind: z.enum(["trabalhador", "PF", "PJ"]),
      document: text(30),
      name: text(100),
      region: text(100),
      category: text(100),
      availability: text(160),
      bio: z.string().trim().max(1500),
      acceptedTerms: z.literal(true),
    })
    .strict(),
  z
    .object({
      action: z.literal("role"),
      role: z.enum(["trabalhador", "empregador", "sindicato"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("saveJob"),
      id: id.optional(),
      version: z.number().int().positive().optional(),
      employerId: id,
      ...jobFields,
    })
    .strict(),
  z
    .object({
      action: z.literal("moderateJob"),
      id,
      version: z.number().int().positive(),
      decision: z.enum(["Publicada", "Ajustes"]),
      reason: text(1000),
    })
    .strict(),
  z
    .object({
      action: z.literal("closeJob"),
      id,
      version: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      action: z.literal("apply"),
      id,
      version: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      action: z.literal("applicationStatus"),
      id,
      version: z.number().int().positive(),
      status: z.enum([
        "Em análise",
        "Entrevista",
        "Contratação informada",
        "Não selecionada",
        "Retirada",
      ]),
    })
    .strict(),
  z.object({ action: z.literal("message"), id, text: text(2000) }).strict(),
  z
    .object({
      action: z.literal("declareHistory"),
      employerName: text(100),
      title: text(100),
      start: date,
      end: date.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("proposeHistory"),
      id,
      title: text(100),
      start: date,
      end: date.optional(),
    })
    .strict(),
  z
    .object({ action: z.literal("confirmHistory"), id, confirm: z.boolean() })
    .strict(),
  z
    .object({
      action: z.literal("closeExperience"),
      id,
      version: z.number().int().positive(),
      end: date,
    })
    .strict(),
  z
    .object({
      action: z.literal("respondClosure"),
      id,
      version: z.number().int().positive(),
      confirm: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("review"),
      id,
      rating: z.number().int().min(1).max(5),
      text: text(2000),
    })
    .strict(),
  z
    .object({
      action: z.literal("moderateReview"),
      id,
      status: z.enum(["Publicada", "Oculta"]),
      reason: text(1000),
    })
    .strict(),
  z
    .object({ action: z.literal("respondReview"), id, text: text(2000) })
    .strict(),
  z
    .object({
      action: z.literal("openCase"),
      title: text(150),
      detail: text(4000),
      applicationId: id.optional(),
      experienceId: id.optional(),
      reviewId: id.optional(),
    })
    .strict(),
  z
    .object({ action: z.literal("resolveCase"), id, resolution: text(4000) })
    .strict(),
  z
    .object({
      action: z.literal("verifyProfile"),
      id: text(100),
      kind: z.enum(["person", "employer"]),
      verified: z.boolean(),
      reason: text(1000),
    })
    .strict(),
  z
    .object({
      action: z.literal("suspendUser"),
      id: text(100),
      suspended: z.boolean(),
      reason: text(1000),
    })
    .strict(),
]);
export type Command = z.infer<typeof commandSchema>;
type Job = {
  id: string;
  employer_id: string;
  status: string;
  version: number;
  current_revision: number;
};
type Application = {
  id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  status: string;
  version: number;
};
type Experience = {
  id: string;
  version: number;
  start_calendar: string;
  worker_id: string;
  employer_id: string | null;
  application_id: string | null;
  origin: string;
  contested: boolean;
  worker_confirmed: boolean;
  employer_confirmed: boolean;
  end_date: Date | null;
};
type Review = {
  id: string;
  employer_id: string;
  worker_id: string;
  status: string;
};
const moderatorRoles = ["ADMIN", "MODERATOR"];
const staffRoles = [...moderatorRoles, "ANALYST"];
async function ownsEmployer(
  client: PoolClient,
  actor: Actor,
  employerId: string | null,
) {
  if (!employerId) return false;
  return (
    (
      await rows(
        "SELECT 1 FROM employer_member WHERE employer_id=$1 AND user_id=$2",
        [employerId, actor.id],
        client,
      )
    ).length > 0
  );
}
async function jobFor(client: PoolClient, id: string) {
  const [job] = await rows<Job>(
    "SELECT * FROM job WHERE id=$1 FOR UPDATE",
    [id],
    client,
  );
  if (!job) throw new HttpError(404, "Vaga não encontrada.");
  return job;
}
async function applicationFor(client: PoolClient, actor: Actor, id: string) {
  const [item] = await rows<Application>(
    "SELECT a.*,j.employer_id FROM application a JOIN job j ON j.id=a.job_id WHERE a.id=$1 FOR UPDATE OF a",
    [id],
    client,
  );
  if (
    !item ||
    (item.worker_id !== actor.id &&
      !(await ownsEmployer(client, actor, item.employer_id)))
  )
    throw new HttpError(404, "Candidatura não encontrada.");
  return item;
}
async function experienceFor(client: PoolClient, actor: Actor, id: string) {
  const [item] = await rows<Experience>(
    "SELECT *,to_char(start_date,'YYYY-MM-DD') start_calendar FROM experience WHERE id=$1 FOR UPDATE",
    [id],
    client,
  );
  if (
    !item ||
    (item.worker_id !== actor.id &&
      !(await ownsEmployer(client, actor, item.employer_id)))
  )
    throw new HttpError(404, "Experiência não encontrada.");
  return item;
}
async function reviewFor(
  client: PoolClient,
  actor: Actor,
  id: string,
  moderation = false,
) {
  const [item] = await rows<Review>(
    "SELECT r.id,r.status,e.employer_id,e.worker_id FROM review r JOIN experience e ON e.id=r.experience_id WHERE r.id=$1 FOR UPDATE OF r",
    [id],
    client,
  );
  if (
    !item ||
    (!moderation &&
      item.worker_id !== actor.id &&
      !(await ownsEmployer(client, actor, item.employer_id)))
  )
    throw new HttpError(404, "Avaliação não encontrada.");
  return item;
}
function versionMatches(actual: number, expected?: number) {
  if (actual !== expected)
    throw new HttpError(
      409,
      "Este registro mudou. Atualize a página antes de continuar.",
    );
}
function checkDates(start: string, end?: string) {
  if (end && end < start)
    throw new HttpError(
      400,
      "A data final deve ser igual ou posterior à inicial.",
    );
}

export async function execute(
  actor: Actor,
  input: Command,
): Promise<{ message: string; id?: string }> {
  return transaction(async (client) => {
    let resource = "account";
    let message = "Alteração salva.";
    switch (input.action) {
      case "profile": {
        if (
          !(input.kind === "PJ"
            ? validCNPJ(input.document)
            : validCPF(input.document))
        )
          throw new HttpError(
            400,
            "Documento com formato ou dígitos verificadores inválidos.",
          );
        const doc = protectDocument(input.document);
        if (input.kind === "trabalhador") {
          await client.query(
            'UPDATE "user" SET name=$2,"updatedAt"=now() WHERE id=$1',
            [actor.id, input.name],
          );
          await client.query(
            "INSERT INTO person(user_id,document_hash,document_cipher,region,category,availability,bio) VALUES($1,$2,$3,$4,$5,$6,$7)",
            [
              actor.id,
              doc.hash,
              doc.cipher,
              input.region,
              input.category,
              input.availability,
              input.bio,
            ],
          );
          await client.query(
            "INSERT INTO role_grant(user_id,role) VALUES($1,'trabalhador') ON CONFLICT DO NOTHING",
            [actor.id],
          );
          await client.query(
            'UPDATE "user" SET "currentRole"=\'trabalhador\' WHERE id=$1',
            [actor.id],
          );
        } else {
          const [employer] = await rows<{ id: string }>(
            "INSERT INTO employer(name,type,document_hash,document_cipher,region) VALUES($1,$2,$3,$4,$5) RETURNING id",
            [input.name, input.kind, doc.hash, doc.cipher, input.region],
            client,
          );
          await client.query(
            "INSERT INTO employer_member(employer_id,user_id) VALUES($1,$2)",
            [employer.id, actor.id],
          );
          await client.query(
            "INSERT INTO role_grant(user_id,role) VALUES($1,'empregador') ON CONFLICT DO NOTHING",
            [actor.id],
          );
          await client.query(
            'UPDATE "user" SET "currentRole"=\'empregador\' WHERE id=$1',
            [actor.id],
          );
          resource = employer.id;
        }
        await client.query(
          "INSERT INTO profile_consent(user_id,profile_kind,terms_version) VALUES($1,$2,'2026-10-v1')",
          [actor.id, input.kind],
        );
        message =
          "Perfil cadastrado. A validação dos dígitos não comprova a identidade ou situação cadastral.";
        break;
      }
      case "updateProfile": {
        requireRole(actor, ["trabalhador"]);
        const result = await client.query(
          'UPDATE person SET region=$2,category=$3,availability=$4,bio=$5,verified=CASE WHEN (SELECT name FROM "user" WHERE id=$1)<>$6 THEN false ELSE verified END WHERE user_id=$1',
          [
            actor.id,
            input.region,
            input.category,
            input.availability,
            input.bio,
            input.name,
          ],
        );
        if (!result.rowCount)
          throw new HttpError(404, "Perfil não encontrado.");
        await client.query(
          'UPDATE "user" SET name=$2,"updatedAt"=now() WHERE id=$1',
          [actor.id, input.name],
        );
        resource = actor.id;
        break;
      }
      case "role": {
        requireRole(
          actor,
          input.role === "sindicato" ? staffRoles : [input.role],
        );
        await client.query('UPDATE "user" SET "currentRole"=$1 WHERE id=$2', [
          input.role,
          actor.id,
        ]);
        break;
      }
      case "saveJob": {
        requireRole(actor, ["empregador"]);
        if (!(await ownsEmployer(client, actor, input.employerId)))
          throw new HttpError(403, "Empregador sem vínculo com sua conta.");
        let job: Job;
        if (input.id) {
          job = await jobFor(client, input.id);
          if (job.employer_id !== input.employerId)
            throw new HttpError(403, "Vaga de outro empregador.");
          versionMatches(job.version, input.version);
          if (job.status === "Encerrada")
            throw new HttpError(409, "Vaga encerrada não pode ser editada.");
          await client.query(
            "UPDATE job SET status='Pendente',current_revision=current_revision+1,version=version+1,reason=NULL,published_at=NULL WHERE id=$1",
            [job.id],
          );
          job.current_revision++;
        } else {
          [job] = await rows<Job>(
            "INSERT INTO job(employer_id) VALUES($1) RETURNING *",
            [input.employerId],
            client,
          );
        }
        await client.query(
          "INSERT INTO job_revision(job_id,number,title,category,region,salary_cents,period,schedule,hours,description,benefits,terms_version,accepted_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'2026-10-v1',$12)",
          [
            job.id,
            job.current_revision,
            input.title,
            input.category,
            input.region,
            input.salaryCents,
            input.period,
            input.schedule,
            input.hours,
            input.description,
            input.benefits,
            actor.id,
          ],
        );
        resource = job.id;
        message =
          "Vaga enviada para análise do sindicato. Só aparecerá na pesquisa após aprovação.";
        break;
      }
      case "moderateJob": {
        requireRole(actor, moderatorRoles);
        const job = await jobFor(client, input.id);
        versionMatches(job.version, input.version);
        if (await ownsEmployer(client, actor, job.employer_id))
          throw new HttpError(403, "Você não pode moderar a própria vaga.");
        if (job.status !== "Pendente")
          throw new HttpError(409, "Esta revisão já foi analisada.");
        await client.query(
          "UPDATE job SET status=$2,reason=$3,version=version+1,published_at=CASE WHEN $2='Publicada' THEN now() ELSE NULL END WHERE id=$1",
          [job.id, input.decision, input.reason],
        );
        await client.query(
          "INSERT INTO moderation(revision_id,moderator_id,decision,reason) SELECT id,$2,$3,$4 FROM job_revision WHERE job_id=$1 AND number=$5",
          [
            job.id,
            actor.id,
            input.decision,
            input.reason,
            job.current_revision,
          ],
        );
        resource = job.id;
        message =
          input.decision === "Publicada"
            ? "Vaga publicada."
            : "Ajustes solicitados ao empregador.";
        break;
      }
      case "closeJob": {
        const job = await jobFor(client, input.id);
        if (!(await ownsEmployer(client, actor, job.employer_id)))
          throw new HttpError(403, "Vaga de outro empregador.");
        versionMatches(job.version, input.version);
        await client.query(
          "UPDATE job SET status='Encerrada',closed_at=now(),version=version+1 WHERE id=$1",
          [job.id],
        );
        resource = job.id;
        break;
      }
      case "apply": {
        requireRole(actor, ["trabalhador"]);
        const job = await jobFor(client, input.id);
        versionMatches(job.version, input.version);
        if (job.status !== "Publicada")
          throw new HttpError(409, "A vaga não está recebendo candidaturas.");
        if (await ownsEmployer(client, actor, job.employer_id))
          throw new HttpError(
            403,
            "Não é possível se candidatar à própria vaga.",
          );
        const [application] = await rows<{ id: string }>(
          "INSERT INTO application(job_id,worker_id,revision_id) SELECT $1,$2,id FROM job_revision WHERE job_id=$1 AND number=$3 RETURNING id",
          [job.id, actor.id, job.current_revision],
          client,
        );
        await client.query(
          "INSERT INTO application_event(application_id,actor_id,status) VALUES($1,$2,'Enviada')",
          [application.id, actor.id],
        );
        resource = application.id;
        message =
          "Candidatura enviada. As condições desta revisão foram preservadas.";
        break;
      }
      case "applicationStatus": {
        const item = await applicationFor(client, actor, input.id);
        versionMatches(item.version, input.version);
        if (actor.id === item.worker_id) {
          if (
            input.status !== "Retirada" ||
            ["Contratação informada", "Não selecionada", "Retirada"].includes(
              item.status,
            )
          )
            throw new HttpError(
              409,
              "Não é possível retirar esta candidatura. Abra uma solicitação ao sindicato se necessário.",
            );
        } else {
          const transitions: Record<string, string[]> = {
            Enviada: ["Em análise", "Entrevista", "Não selecionada"],
            "Em análise": [
              "Entrevista",
              "Contratação informada",
              "Não selecionada",
            ],
            Entrevista: ["Contratação informada", "Não selecionada"],
          };
          if (!transitions[item.status]?.includes(input.status))
            throw new HttpError(409, "Mudança de status inválida.");
        }
        await client.query(
          "UPDATE application SET status=$2,version=version+1 WHERE id=$1",
          [item.id, input.status],
        );
        await client.query(
          "INSERT INTO application_event(application_id,actor_id,status) VALUES($1,$2,$3)",
          [item.id, actor.id, input.status],
        );
        resource = item.id;
        break;
      }
      case "message": {
        const item = await applicationFor(client, actor, input.id);
        if (["Retirada", "Não selecionada"].includes(item.status))
          throw new HttpError(409, "Esta conversa foi encerrada.");
        await client.query(
          "INSERT INTO message(application_id,sender_id,text) VALUES($1,$2,$3)",
          [item.id, actor.id, input.text],
        );
        resource = item.id;
        message = "Mensagem enviada.";
        break;
      }
      case "declareHistory": {
        requireRole(actor, ["trabalhador"]);
        checkDates(input.start, input.end);
        const [item] = await rows<{ id: string }>(
          "INSERT INTO experience(worker_id,employer_name,title,start_date,end_date,origin,worker_confirmed) VALUES($1,$2,$3,$4,$5,'Autodeclarado',true) RETURNING id",
          [
            actor.id,
            input.employerName,
            input.title,
            input.start,
            input.end ?? null,
          ],
          client,
        );
        resource = item.id;
        message =
          "Experiência autodeclarada salva. Ela não foi confirmada pelo empregador.";
        break;
      }
      case "proposeHistory": {
        const item = await applicationFor(client, actor, input.id);
        checkDates(input.start, input.end);
        if (item.status !== "Contratação informada")
          throw new HttpError(
            409,
            "Informe primeiro a contratação nesta candidatura.",
          );
        const [experience] = await rows<{ id: string }>(
          "INSERT INTO experience(worker_id,employer_id,application_id,employer_name,title,start_date,end_date,origin,worker_confirmed,employer_confirmed) SELECT $1,e.id,$2,e.name,$3,$4,$5,'Plataforma',$6,$7 FROM employer e WHERE e.id=$8 RETURNING id",
          [
            item.worker_id,
            item.id,
            input.title,
            input.start,
            input.end ?? null,
            item.worker_id === actor.id,
            item.worker_id !== actor.id,
            item.employer_id,
          ],
          client,
        );
        resource = experience.id;
        message =
          "Experiência registrada. Aguarde a confirmação da outra parte.";
        break;
      }
      case "confirmHistory": {
        const item = await experienceFor(client, actor, input.id);
        if (item.origin !== "Plataforma" || item.contested)
          throw new HttpError(
            409,
            "Experiência autodeclarada ou contestada não pode ser confirmada.",
          );
        const isWorker = item.worker_id === actor.id;
        if (isWorker ? item.worker_confirmed : item.employer_confirmed)
          throw new HttpError(409, "Você já confirmou esta experiência.");
        const column = isWorker ? "worker_confirmed" : "employer_confirmed";
        if (input.confirm) {
          await client.query(
            `UPDATE experience SET ${column}=true,version=version+1,confirmed_at=CASE WHEN ${isWorker ? "employer_confirmed" : "worker_confirmed"} THEN now() ELSE NULL END WHERE id=$1`,
            [item.id],
          );
        } else {
          await client.query(
            "UPDATE experience SET contested=true,confirmed_at=NULL,version=version+1 WHERE id=$1",
            [item.id],
          );
          await client.query(
            "UPDATE review SET status='Contestada' WHERE experience_id=$1",
            [item.id],
          );
          await client.query(
            "INSERT INTO support_case(author_id,title,detail,experience_id) VALUES($1,'Experiência não reconhecida','Uma das partes não reconheceu as condições desta experiência.',$2)",
            [actor.id, item.id],
          );
        }
        resource = item.id;
        break;
      }
      case "closeExperience": {
        const item = await experienceFor(client, actor, input.id);
        versionMatches(item.version, input.version);
        checkDates(item.start_calendar, input.end);
        if (item.end_date || item.contested)
          throw new HttpError(
            409,
            "Experiência encerrada ou contestada não pode receber uma data final.",
          );
        if (item.origin === "Autodeclarado") {
          await client.query(
            "UPDATE experience SET end_date=$2,version=version+1 WHERE id=$1",
            [item.id, input.end],
          );
          message =
            "Experiência autodeclarada encerrada. Ela continua sem confirmação do empregador.";
        } else {
          if (!item.worker_confirmed || !item.employer_confirmed)
            throw new HttpError(
              409,
              "Confirme primeiro a experiência com a outra parte.",
            );
          const pending = await rows(
            "SELECT id FROM experience_closure WHERE experience_id=$1 AND status='Pendente'",
            [item.id],
            client,
          );
          if (pending.length)
            throw new HttpError(
              409,
              "Já existe uma data final aguardando confirmação.",
            );
          const isWorker = item.worker_id === actor.id;
          await client.query(
            "INSERT INTO experience_closure(experience_id,end_date,proposed_by,worker_confirmed,employer_confirmed) VALUES($1,$2,$3,$4,$5)",
            [item.id, input.end, actor.id, isWorker, !isWorker],
          );
          await client.query(
            "UPDATE experience SET version=version+1 WHERE id=$1",
            [item.id],
          );
          message = "Data final enviada. Aguarde a confirmação da outra parte.";
        }
        resource = item.id;
        break;
      }
      case "respondClosure": {
        const [parent] = await rows<{ experience_id: string }>(
          "SELECT experience_id FROM experience_closure WHERE id=$1",
          [input.id],
          client,
        );
        if (!parent)
          throw new HttpError(404, "Proposta de encerramento não encontrada.");
        // Every closure mutation locks the experience before its proposal.
        const item = await experienceFor(client, actor, parent.experience_id);
        versionMatches(item.version, input.version);
        const [proposal] = await rows<{
          status: string;
          worker_confirmed: boolean;
          employer_confirmed: boolean;
        }>(
          "SELECT status,worker_confirmed,employer_confirmed FROM experience_closure WHERE id=$1 FOR UPDATE",
          [input.id],
          client,
        );
        const isWorker = item.worker_id === actor.id;
        if (
          proposal.status !== "Pendente" ||
          item.end_date ||
          item.contested ||
          !item.worker_confirmed ||
          !item.employer_confirmed
        )
          throw new HttpError(
            409,
            "Esta proposta não pode mais ser respondida.",
          );
        if (isWorker ? proposal.worker_confirmed : proposal.employer_confirmed)
          throw new HttpError(
            409,
            "A outra parte precisa responder à sua proposta.",
          );
        if (input.confirm) {
          const column = isWorker ? "worker_confirmed" : "employer_confirmed";
          await client.query(
            `UPDATE experience_closure SET ${column}=true,status='Confirmada',resolved_at=now(),resolved_by=$2 WHERE id=$1`,
            [input.id, actor.id],
          );
          await client.query(
            "UPDATE experience SET end_date=(SELECT end_date FROM experience_closure WHERE id=$2),version=version+1 WHERE id=$1",
            [item.id, input.id],
          );
          message = "Encerramento confirmado pelas duas partes.";
        } else {
          await client.query(
            "UPDATE experience_closure SET status='Recusada',resolved_at=now(),resolved_by=$2 WHERE id=$1",
            [input.id, actor.id],
          );
          await client.query(
            "UPDATE experience SET version=version+1 WHERE id=$1",
            [item.id],
          );
          await client.query(
            "INSERT INTO support_case(author_id,title,detail,experience_id) VALUES($1,'Data final não reconhecida','Uma das partes recusou a data final proposta. O período já confirmado permanece em andamento.',$2)",
            [actor.id, item.id],
          );
          message =
            "Data final recusada. O período confirmado permanece em andamento; um relato foi aberto para atendimento.";
        }
        resource = item.id;
        break;
      }
      case "review": {
        const item = await experienceFor(client, actor, input.id);
        if (
          item.worker_id !== actor.id ||
          !item.worker_confirmed ||
          !item.employer_confirmed ||
          item.contested ||
          !item.end_date
        )
          throw new HttpError(
            403,
            "Só é possível avaliar uma experiência encerrada e confirmada pelas duas partes.",
          );
        const [review] = await rows<{ id: string }>(
          "INSERT INTO review(experience_id,author_id,rating,text) VALUES($1,$2,$3,$4) RETURNING id",
          [item.id, actor.id, input.rating, input.text],
          client,
        );
        resource = review.id;
        message = "Avaliação enviada para moderação.";
        break;
      }
      case "moderateReview": {
        requireRole(actor, moderatorRoles);
        const item = await reviewFor(client, actor, input.id, true);
        if (
          item.worker_id === actor.id ||
          (await ownsEmployer(client, actor, item.employer_id))
        )
          throw new HttpError(
            403,
            "Não é possível moderar uma avaliação da qual você participa.",
          );
        if (item.status === "Contestada" && input.status === "Publicada")
          throw new HttpError(
            409,
            "Resolva a contestação antes de publicar. A resolução não republica automaticamente a avaliação.",
          );
        if (input.status === "Publicada") {
          const eligible = await rows(
            "SELECT 1 FROM review r JOIN experience e ON e.id=r.experience_id WHERE r.id=$1 AND e.worker_confirmed AND e.employer_confirmed AND NOT e.contested AND e.end_date IS NOT NULL AND NOT EXISTS(SELECT 1 FROM support_case c WHERE c.review_id=r.id AND c.status='Aberto')",
            [item.id],
            client,
          );
          if (!eligible.length)
            throw new HttpError(
              409,
              "A experiência ou a contestação ainda não permite publicação.",
            );
        }
        await client.query(
          "UPDATE review SET status=$2,moderation_reason=$3 WHERE id=$1",
          [item.id, input.status, input.reason],
        );
        resource = item.id;
        break;
      }
      case "respondReview": {
        const item = await reviewFor(client, actor, input.id);
        if (!(await ownsEmployer(client, actor, item.employer_id)))
          throw new HttpError(403, "Só o empregador avaliado pode responder.");
        if (item.status === "Contestada")
          throw new HttpError(
            409,
            "Aguarde a resolução da contestação para enviar uma resposta.",
          );
        await client.query(
          "UPDATE review SET response=$2,response_by=$3,status='Em análise' WHERE id=$1",
          [item.id, input.text, actor.id],
        );
        resource = item.id;
        message = "Resposta enviada para moderação junto à avaliação.";
        break;
      }
      case "openCase": {
        if (input.applicationId)
          await applicationFor(client, actor, input.applicationId);
        if (input.experienceId)
          await experienceFor(client, actor, input.experienceId);
        if (input.reviewId) {
          const item = await reviewFor(client, actor, input.reviewId);
          await client.query(
            "UPDATE review SET status='Contestada' WHERE id=$1",
            [item.id],
          );
        }
        const [item] = await rows<{ id: string }>(
          "INSERT INTO support_case(author_id,title,detail,application_id,experience_id,review_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
          [
            actor.id,
            input.title,
            input.detail,
            input.applicationId ?? null,
            input.experienceId ?? null,
            input.reviewId ?? null,
          ],
          client,
        );
        resource = item.id;
        message = "Solicitação enviada ao sindicato.";
        break;
      }
      case "resolveCase": {
        requireRole(actor, moderatorRoles);
        const [item] = await rows<{
          id: string;
          author_id: string;
          review_id: string | null;
          application_id: string | null;
          experience_id: string | null;
          status: string;
        }>(
          "SELECT * FROM support_case WHERE id=$1 FOR UPDATE",
          [input.id],
          client,
        );
        if (!item) throw new HttpError(404, "Solicitação não encontrada.");
        if (item.author_id === actor.id)
          throw new HttpError(
            403,
            "Você não pode resolver a própria solicitação.",
          );
        if (item.status !== "Aberto")
          throw new HttpError(409, "Esta solicitação já foi resolvida.");
        if (item.application_id || item.experience_id) {
          const participants = item.application_id
            ? await rows<{ worker_id: string; employer_id: string }>(
                "SELECT a.worker_id,j.employer_id FROM application a JOIN job j ON j.id=a.job_id WHERE a.id=$1",
                [item.application_id],
                client,
              )
            : await rows<{ worker_id: string; employer_id: string }>(
                "SELECT worker_id,employer_id FROM experience WHERE id=$1",
                [item.experience_id],
                client,
              );
          if (
            participants[0] &&
            (participants[0].worker_id === actor.id ||
              (await ownsEmployer(client, actor, participants[0].employer_id)))
          )
            throw new HttpError(
              403,
              "Há conflito de interesse nesta solicitação.",
            );
        }
        if (item.review_id) {
          const review = await reviewFor(client, actor, item.review_id, true);
          if (
            review.worker_id === actor.id ||
            (await ownsEmployer(client, actor, review.employer_id))
          )
            throw new HttpError(
              403,
              "Há conflito de interesse nesta solicitação.",
            );
          await client.query(
            "UPDATE review SET status='Oculta',moderation_reason=$2 WHERE id=$1",
            [item.review_id, input.resolution],
          );
        }
        await client.query(
          "UPDATE support_case SET status='Resolvido',resolution=$2,resolved_by=$3,resolved_at=now() WHERE id=$1",
          [item.id, input.resolution, actor.id],
        );
        resource = item.id;
        break;
      }
      case "verifyProfile": {
        requireRole(actor, ["ADMIN"]);
        if (
          (input.kind === "person" && input.id === actor.id) ||
          (input.kind === "employer" &&
            (await ownsEmployer(client, actor, input.id)))
        )
          throw new HttpError(
            403,
            "Não é possível verificar seu próprio cadastro.",
          );
        const result = await client.query(
          input.kind === "person"
            ? "UPDATE person SET verified=$2 WHERE user_id=$1"
            : "UPDATE employer SET verified=$2 WHERE id=$1",
          [input.id, input.verified],
        );
        if (!result.rowCount)
          throw new HttpError(404, "Cadastro não encontrado.");
        resource = input.id;
        break;
      }
      case "suspendUser": {
        requireRole(actor, ["ADMIN"]);
        if (input.id === actor.id)
          throw new HttpError(403, "Não é possível suspender a própria conta.");
        const result = await client.query(
          'UPDATE "user" SET suspended=$2 WHERE id=$1',
          [input.id, input.suspended],
        );
        if (!result.rowCount) throw new HttpError(404, "Conta não encontrada.");
        if (input.suspended)
          await client.query('DELETE FROM session WHERE "userId"=$1', [
            input.id,
          ]);
        resource = input.id;
        break;
      }
    }
    await client.query(
      "INSERT INTO audit_event(actor_id,action,resource) VALUES($1,$2,$3)",
      [
        actor.id,
        input.action + ("reason" in input ? `: ${input.reason}` : ""),
        resource,
      ],
    );
    return { message, id: resource };
  });
}
