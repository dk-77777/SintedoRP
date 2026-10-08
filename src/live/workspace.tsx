"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ActionLink,
  Badge,
  Empty,
  Field,
  NoticeBox,
  Stats,
  Title,
} from "@/components/ui";
import { Icon } from "@/components/icon";
import { useLive } from "./provider";
import { categories } from "./public";
import { ConfirmAction, displayDate, money, MutationForm, value } from "./ui";
import type { ApplicationRow, ReportRow } from "./types";
import { todayInSaoPaulo } from "@/shared/calendar";
export function Dashboard() {
  const { state } = useLive();
  if (!state?.user) return null;
  const role = state.user.role;
  const staff = role === "sindicato";
  const canModerate = state.user.roles.some((r) =>
    ["ADMIN", "MODERATOR"].includes(r),
  );
  const worker = role === "trabalhador";
  const jobsPending = state.jobs.filter((j) => j.status === "Pendente");
  const reviewsPending = state.reviews.filter((r) => r.status === "Em análise");
  const casesOpen = state.cases.filter((c) => c.status === "Aberto");
  const historyPending = state.experiences.filter((e) => {
    const mine = e.worker_id === state.user?.id;
    return (
      !e.contested &&
      e.origin === "Plataforma" &&
      (!(mine ? e.worker_confirmed : e.employer_confirmed) ||
        (e.closure_status === "Pendente" &&
          !(mine ? e.closure_worker_confirmed : e.closure_employer_confirmed)))
    );
  });
  const candidates = state.applications.filter((a) => a.status === "Enviada");
  const tasks: { title: string; description: string; href: string }[] = [];
  if (staff && canModerate) {
    if (jobsPending.length)
      tasks.push({
        title: `${jobsPending.length} vaga(s) aguardando análise`,
        description: "Confira as condições da vaga.",
        href: "/sindicato/vagas",
      });
    if (reviewsPending.length)
      tasks.push({
        title: `${reviewsPending.length} avaliação(ões) para analisar`,
        description: "Revise os relatos.",
        href: "/sindicato/avaliacoes",
      });
    if (casesOpen.length)
      tasks.push({
        title: `${casesOpen.length} atendimento(s) aberto(s)`,
        description: "Responda aos pedidos de apoio.",
        href: "/sindicato/atendimentos",
      });
  } else if (!staff) {
    const missingProfile = worker
      ? !state.person
      : !state.employers.some((e) => e.owned);
    if (missingProfile)
      tasks.push({
        title: "Complete seu perfil",
        description: "Informe seus dados para começar.",
        href: "/cadastro/perfil",
      });
    if (historyPending.length)
      tasks.push({
        title: `${historyPending.length} confirmação(ões) pendente(s)`,
        description: "Confira o período de trabalho.",
        href: worker ? "/trabalhador/historico" : "/empregador/historico",
      });
    if (!worker && candidates.length)
      tasks.push({
        title: `${candidates.length} candidatura(s) recebida(s)`,
        description: "Revise os perfis e atualize o processo.",
        href: "/empregador/candidatos",
      });
    if (!worker && jobsPending.length)
      tasks.push({
        title: `${jobsPending.length} vaga(s) em análise`,
        description: "A publicação depende da aprovação sindical.",
        href: "/empregador/vagas",
      });
    const interviews = worker
      ? state.applications.filter((a) => a.status === "Entrevista")
      : [];
    if (interviews.length)
      tasks.push({
        title: `${interviews.length} entrevista(s)`,
        description: "Acesse a conversa para combinar os detalhes.",
        href: "/trabalhador/candidaturas",
      });
  }
  const mainHref = staff
    ? canModerate
      ? "/sindicato/vagas"
      : "/sindicato/relatorios"
    : worker
      ? "/vagas"
      : "/empregador/vagas/nova";
  const mainLabel = staff
    ? canModerate
      ? "Analisar vagas"
      : "Consultar relatórios"
    : worker
      ? "Buscar oportunidades"
      : "Cadastrar vaga";
  return (
    <>
      <div className="dashboard-heading">
        <Title
          title={`Olá, ${state.user.name.split(" ")[0]}.`}
          description={
            staff
              ? canModerate
                ? "Pendências e indicadores da equipe."
                : "Indicadores da plataforma."
              : "Seus próximos passos."
          }
        />
        <ActionLink href={mainHref}>
          {mainLabel}
          <Icon name="arrow" size={18} />
        </ActionLink>
      </div>
      {!staff || canModerate ? (
        <section className="task-panel" aria-labelledby="tasks-title">
          <div className="task-panel-heading">
            <span>
              <Icon name="clock" size={21} />
            </span>
            <div>
              <h2 id="tasks-title">
                {tasks.length ? "Pendências" : "Tudo em dia"}
              </h2>
              <p>
                {tasks.length
                  ? "Itens que aguardam sua ação."
                  : "Sem ações pendentes."}
              </p>
            </div>
          </div>
          {tasks.length ? (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.href}>
                  <Link href={task.href}>
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.description}</small>
                    </div>
                    <Icon name="arrow" size={20} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="tasks-complete">
              <Icon name="check" size={23} />
              <div>
                <strong>Nenhuma ação necessária.</strong>
                <p>
                  {staff
                    ? "Novos itens aparecerão aqui."
                    : "Acesse suas atividades pelo menu."}
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <NoticeBox>
          Contratações informadas e experiências confirmadas são indicadores
          diferentes.
        </NoticeBox>
      )}
      {(!staff || canModerate) && (
        <>
          <h2 className="dashboard-section-heading">Resumo</h2>
          <Stats
            items={
              staff
                ? [
                    {
                      label: "Vagas para análise",
                      value: jobsPending.length,
                      icon: "bag",
                    },
                    {
                      label: "Avaliações para análise",
                      value: reviewsPending.length,
                      icon: "star",
                    },
                    {
                      label: "Atendimentos abertos",
                      value: casesOpen.length,
                      icon: "chat",
                    },
                  ]
                : [
                    {
                      label: "Candidaturas",
                      value: state.applications.length,
                      icon: "bag",
                    },
                    {
                      label: "Conversas",
                      value: new Set(
                        state.messages.map((m) => m.application_id),
                      ).size,
                      icon: "chat",
                    },
                    {
                      label: "Experiências confirmadas",
                      value: state.experiences.filter(
                        (e) => e.confirmed_at && !e.contested,
                      ).length,
                      icon: "check",
                    },
                  ]
            }
          />
        </>
      )}
      {!staff && (
        <section className="recent-section" aria-labelledby="recent-title">
          <div className="panel-heading">
            <h2 id="recent-title">
              {worker ? "Candidaturas recentes" : "Suas vagas"}
            </h2>
            <Link
              className="inline-link"
              href={worker ? "/trabalhador/candidaturas" : "/empregador/vagas"}
            >
              Ver todas <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="recent-list">
            {worker
              ? state.applications.slice(0, 3).map((a) => (
                  <div className="recent-item" key={a.id}>
                    <div>
                      <strong>{a.title}</strong>
                      <p>
                        {a.employer_name} · {a.region}
                      </p>
                    </div>
                    <Badge>{a.status}</Badge>
                  </div>
                ))
              : state.jobs.slice(0, 3).map((j) => (
                  <div className="recent-item" key={j.id}>
                    <div>
                      <strong>{j.title}</strong>
                      <p>
                        {money(j.salary_cents)} / {j.period.toLowerCase()} ·{" "}
                        {j.region}
                      </p>
                    </div>
                    <Badge>{j.status}</Badge>
                  </div>
                ))}
          </div>
          {(worker ? !state.applications.length : !state.jobs.length) && (
            <p className="muted">
              {worker
                ? "Suas candidaturas aparecerão aqui depois do primeiro envio."
                : "Cadastre uma vaga para acompanhar sua análise e publicação."}
            </p>
          )}
        </section>
      )}
      <section className="dashboard-help">
        <div>
          <h2>Precisa de ajuda?</h2>
          <p>Fale com o sindicato por aqui.</p>
        </div>
        <ActionLink
          href={
            staff
              ? canModerate
                ? "/sindicato/atendimentos"
                : "/contato"
              : "/atendimento"
          }
          secondary
        >
          {staff && canModerate ? "Ver atendimentos" : "Pedir orientação"}
        </ActionLink>
      </section>
    </>
  );
}
export function WorkerProfile() {
  const { state } = useLive();
  const profile = state?.person;
  if (!profile)
    return (
      <>
        <Title title="Complete seu perfil" />
        <ActionLink href="/cadastro/perfil">
          Cadastrar perfil profissional
        </ActionLink>
      </>
    );
  return (
    <>
      <Title
        title="Meu perfil profissional"
        description="Documento protegido. Alterações no nome exigem nova verificação."
      />
      <Badge>
        {profile.verified
          ? "Verificado manualmente"
          : "Verificação documental pendente"}
      </Badge>
      <MutationForm
        build={(f) => ({
          action: "updateProfile",
          name: value(f, "name"),
          region: value(f, "region"),
          category: value(f, "category"),
          availability: value(f, "availability"),
          bio: value(f, "bio"),
        })}
      >
        <Field label="Nome completo">
          <input
            name="name"
            defaultValue={state?.user?.name}
            required
            maxLength={100}
          />
        </Field>
        <Field label="Cidade e região">
          <input
            name="region"
            defaultValue={profile.region}
            required
            maxLength={100}
          />
        </Field>
        <Field label="Área profissional">
          <select name="category" defaultValue={profile.category}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Disponibilidade">
          <input
            name="availability"
            defaultValue={profile.availability}
            required
            maxLength={160}
          />
        </Field>
        <Field label="Apresentação profissional">
          <textarea
            name="bio"
            defaultValue={profile.bio}
            maxLength={1500}
            rows={4}
          />
        </Field>
        <button className="button primary">Salvar perfil</button>
      </MutationForm>
    </>
  );
}
export function EmployerJobs() {
  const { state, act, busy } = useLive();
  const owned = state?.employers.filter((e) => e.owned).map((e) => e.id) ?? [];
  const jobs = state?.jobs.filter((j) => owned.includes(j.employer_id)) ?? [];
  return (
    <>
      <Title
        title="Minhas vagas"
        description="A publicação depende de análise sindical."
        action={
          <ActionLink href="/empregador/vagas/nova">
            Nova vaga <Icon name="plus" size={18} />
          </ActionLink>
        }
      />
      {jobs.length ? (
        jobs.map((j) => (
          <article key={j.id} className="form-card live-record">
            <div className="record-heading">
              <div>
                <Badge>{j.status}</Badge>
                <h2>{j.title}</h2>
                <p>
                  {j.employer_name} · Revisão {j.number} ·{" "}
                  {money(j.salary_cents)}/{j.period.toLowerCase()}
                </p>
              </div>
              <div className="inline-actions">
                {j.status !== "Encerrada" && (
                  <>
                    <ActionLink
                      href={`/empregador/vagas/${j.id}/editar`}
                      secondary
                      small
                    >
                      Editar e reenviar
                    </ActionLink>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        void act({
                          action: "closeJob",
                          id: j.id,
                          version: j.version,
                        })
                      }
                    >
                      Encerrar vaga
                    </button>
                  </>
                )}
              </div>
            </div>
            {j.reason && <NoticeBox>{j.reason}</NoticeBox>}
          </article>
        ))
      ) : (
        <Empty
          title="Você ainda não publicou vagas"
          description="Informe as condições da vaga."
        />
      )}
    </>
  );
}
export function JobForm({ id }: { id?: string }) {
  const { state } = useLive();
  const router = useRouter();
  const job = state?.jobs.find((j) => j.id === id);
  const employers = state?.employers.filter((e) => e.owned) ?? [];
  if (!employers.length)
    return (
      <>
        <Title title="Cadastre o empregador" />
        <ActionLink href="/cadastro/perfil">
          Criar perfil de empregador
        </ActionLink>
      </>
    );
  if (id && !job)
    return (
      <>
        <Title title="Vaga não encontrada" />
        <Empty
          title="Acesso indisponível"
          description="Volte à lista das suas vagas."
        />
      </>
    );
  return (
    <>
      <Title
        title={job ? "Editar condições da vaga" : "Cadastrar uma vaga"}
        description="A publicação depende de análise sindical."
      />
      <NoticeBox>
        Confirme as regras vigentes com o sindicato. O sistema não define piso
        salarial.
      </NoticeBox>
      <MutationForm
        build={(form) => ({
          action: "saveJob",
          ...(job ? { id: job.id, version: job.version } : {}),
          employerId: value(form, "employerId"),
          title: value(form, "title"),
          category: value(form, "category"),
          region: value(form, "region"),
          salaryCents: Math.round(Number(value(form, "salary")) * 100),
          period: value(form, "period"),
          schedule: value(form, "schedule"),
          hours: value(form, "hours"),
          description: value(form, "description"),
          benefits: value(form, "benefits"),
          acceptedTerms: form.get("terms") === "on",
        })}
        onSuccess={() => router.push("/empregador/vagas")}
      >
        <fieldset className="form-section">
          <legend>
            <span>01</span> Identificação da oportunidade
          </legend>
          <div className="form-grid">
            <Field label="Empregador">
              <select name="employerId" defaultValue={job?.employer_id}>
                {employers.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Função">
              <select
                name="category"
                defaultValue={job?.category ?? "Doméstica"}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Título da vaga">
              <input
                name="title"
                defaultValue={job?.title}
                required
                maxLength={100}
              />
            </Field>
            <Field
              label="Cidade e região"
              hint="Informe a região, sem endereço residencial completo."
            >
              <input
                name="region"
                defaultValue={job?.region ?? employers[0]?.region}
                required
                maxLength={100}
              />
            </Field>
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>
            <span>02</span> Remuneração e jornada
          </legend>
          <div className="form-grid">
            <Field label="Remuneração (R$)">
              <input
                type="number"
                name="salary"
                min="0.01"
                max="1000000"
                step="0.01"
                defaultValue={job ? job.salary_cents / 100 : undefined}
                required
              />
            </Field>
            <Field label="Pagamento por">
              <select name="period" defaultValue={job?.period ?? "Mês"}>
                {["Mês", "Dia", "Hora"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Jornada">
              <input
                name="schedule"
                defaultValue={job?.schedule}
                required
                maxLength={160}
                placeholder="Ex.: segunda a sexta"
              />
            </Field>
            <Field label="Horário">
              <input
                name="hours"
                defaultValue={job?.hours}
                required
                maxLength={160}
                placeholder="Ex.: das 8h às 17h, com intervalo"
              />
            </Field>
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>
            <span>03</span> Atividades e benefícios
          </legend>
          <Field label="Atividades e condições">
            <textarea
              name="description"
              defaultValue={job?.description}
              rows={5}
              required
              maxLength={4000}
            />
          </Field>
          <Field label="Benefícios">
            <textarea
              name="benefits"
              defaultValue={job?.benefits}
              rows={3}
              maxLength={1500}
            />
          </Field>
        </fieldset>
        <label className="checkbox-field">
          <input name="terms" type="checkbox" required />
          Confirmo as condições informadas e aceito a análise sindical desta
          revisão (2026-10-v1).
        </label>
        <button className="button primary">
          Enviar para análise <Icon name="arrow" size={18} />
        </button>
      </MutationForm>
    </>
  );
}
export function ModerationJobs({ id }: { id?: string }) {
  const { state } = useLive();
  const job = state?.jobs.find((j) => j.id === id);
  if (id) {
    if (!job)
      return (
        <>
          <Title title="Vaga não encontrada" />
        </>
      );
    return (
      <>
        <Title
          title={job.title}
          description={`${job.employer_name} · revisão ${job.number}`}
        />
        <article className="form-card prose">
          <Badge>{job.status}</Badge>
          <h2>Condições para análise</h2>
          <p>
            {money(job.salary_cents)}/{job.period.toLowerCase()} · {job.region}
          </p>
          <p>
            {job.schedule} · {job.hours}
          </p>
          <p className="preserve-lines">{job.description}</p>
          <p>{job.benefits}</p>
          <p>
            Cadastro do empregador:{" "}
            {job.employer_verified
              ? "verificado manualmente"
              : "pendente de verificação documental"}
            .
          </p>
        </article>
        {job.status === "Pendente" && (
          <MutationForm
            build={(form) => ({
              action: "moderateJob",
              id: job.id,
              version: job.version,
              decision: value(form, "decision"),
              reason: value(form, "reason"),
            })}
          >
            <Field label="Decisão">
              <select name="decision">
                <option>Publicada</option>
                <option>Ajustes</option>
              </select>
            </Field>
            <Field label="Fundamentação e orientações">
              <textarea name="reason" required maxLength={1000} rows={4} />
            </Field>
            <button className="button primary">Registrar decisão</button>
          </MutationForm>
        )}
      </>
    );
  }
  const jobs =
    state?.jobs.filter(
      (j) => j.status === "Pendente" || j.status === "Ajustes",
    ) ?? [];
  return (
    <>
      <Title
        title="Análise de vagas"
        description="Cada revisão é analisada separadamente."
      />
      {jobs.length ? (
        jobs.map((j) => (
          <article className="form-card record-heading" key={j.id}>
            <div>
              <Badge>{j.status}</Badge>
              <h2>{j.title}</h2>
              <p>
                {j.employer_name} · {j.region}
              </p>
            </div>
            <ActionLink href={`/sindicato/vagas/${j.id}`} secondary small>
              Analisar revisão {j.number}
            </ActionLink>
          </article>
        ))
      ) : (
        <Empty
          title="Nenhuma vaga aguardando análise"
          description="Novas revisões aparecerão nesta fila."
        />
      )}
    </>
  );
}
function Proposal({ application }: { application: ApplicationRow }) {
  return (
    <MutationForm
      label={`Registrar experiência de ${application.title}`}
      build={(f) => ({
        action: "proposeHistory",
        id: application.id,
        title: value(f, "title"),
        start: value(f, "start"),
        ...(value(f, "end") ? { end: value(f, "end") } : {}),
      })}
    >
      <h3>Registrar o período trabalhado</h3>
      <p>
        A contratação informada não comprova que houve trabalho. Registre
        somente um período que já aconteceu; a outra parte deverá confirmar.
      </p>
      <Field label="Função exercida">
        <input
          name="title"
          defaultValue={application.title}
          required
          maxLength={100}
        />
      </Field>
      <div className="form-grid">
        <Field label="Início do trabalho">
          <input name="start" type="date" max={todayInSaoPaulo()} required />
        </Field>
        <Field label="Fim do trabalho (opcional)">
          <input name="end" type="date" max={todayInSaoPaulo()} />
        </Field>
      </div>
      <button className="button secondary">Solicitar confirmação</button>
    </MutationForm>
  );
}
export function Applications() {
  const { state, act, busy } = useLive();
  const worker = state?.user?.role === "trabalhador";
  const applications =
    state?.applications.filter((a) =>
      worker ? a.worker_id === state.user?.id : a.worker_id !== state.user?.id,
    ) ?? [];
  const transitions: Record<string, string[]> = {
    Enviada: ["Em análise", "Entrevista", "Não selecionada"],
    "Em análise": ["Entrevista", "Contratação informada", "Não selecionada"],
    Entrevista: ["Contratação informada", "Não selecionada"],
  };
  return (
    <>
      <Title
        title={worker ? "Minhas candidaturas" : "Candidaturas recebidas"}
        description="A candidatura mantém as condições originais da vaga."
      />
      {applications.length ? (
        applications.map((a) => (
          <article className="form-card live-record" key={a.id}>
            <div className="record-heading">
              <div>
                <Badge>{a.status}</Badge>
                <h2>{a.title}</h2>
                <p>
                  {worker ? a.employer_name : a.worker_name} ·{" "}
                  {displayDate(a.created_at)}
                </p>
              </div>
              <ActionLink href={`/mensagens/${a.id}`} secondary small>
                Abrir conversa
              </ActionLink>
            </div>
            <details>
              <summary>
                Condições da candidatura · revisão {a.revision_number}
              </summary>
              <p>
                {money(a.salary_cents)}/{a.period.toLowerCase()} · {a.schedule}{" "}
                · {a.hours} · {a.region}
              </p>
              {!worker && (
                <>
                  <h3>Apresentação profissional</h3>
                  <p>
                    {a.category} · {a.availability}
                  </p>
                  <p className="preserve-lines">
                    {a.bio || "Sem apresentação adicional."}
                  </p>
                </>
              )}
            </details>
            {worker
              ? ![
                  "Retirada",
                  "Não selecionada",
                  "Contratação informada",
                ].includes(a.status) && (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      void act({
                        action: "applicationStatus",
                        id: a.id,
                        version: a.version,
                        status: "Retirada",
                      })
                    }
                  >
                    Retirar candidatura
                  </button>
                )
              : transitions[a.status] && (
                  <MutationForm
                    build={(f) => ({
                      action: "applicationStatus",
                      id: a.id,
                      version: a.version,
                      status: value(f, "status"),
                    })}
                  >
                    <Field label="Próxima etapa">
                      <select name="status">
                        {transitions[a.status].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <button className="button secondary">
                      Atualizar candidatura
                    </button>
                  </MutationForm>
                )}
            {a.status === "Contratação informada" &&
              !state?.experiences.some((e) => e.application_id === a.id) && (
                <Proposal application={a} />
              )}
          </article>
        ))
      ) : (
        <Empty
          title="Ainda não há candidaturas"
          description={
            worker
              ? "Encontre uma oportunidade para começar."
              : "As candidaturas aparecerão após a publicação das suas vagas."
          }
        />
      )}
    </>
  );
}
export function Messages({ id }: { id?: string }) {
  const { state } = useLive();
  const applications = state?.applications ?? [];
  const active =
    applications.find((a) => a.id === id) ??
    (!id ? applications[0] : undefined);
  if (!active)
    return (
      <>
        <Title title="Mensagens" />
        <Empty
          title="Nenhuma conversa disponível"
          description="As conversas começam a partir de uma candidatura autorizada."
        />
      </>
    );
  const worker = active.worker_id === state?.user?.id;
  const closed = ["Retirada", "Não selecionada"].includes(active.status);
  return (
    <>
      <Title title="Mensagens" description="Conversa privada da candidatura." />
      <div className="messages-layout" data-conversation-open={Boolean(id)}>
        <nav className="conversation-list" aria-label="Conversas">
          {applications.map((a) => (
            <Link
              className={`conversation-link ${active.id === a.id ? "selected" : ""}`}
              key={a.id}
              href={`/mensagens/${a.id}`}
              aria-current={active.id === a.id ? "page" : undefined}
            >
              <strong>
                {a.worker_id === state?.user?.id
                  ? a.employer_name
                  : a.worker_name}
              </strong>
              <span>{a.title}</span>
            </Link>
          ))}
        </nav>
        <section className="chat-panel">
          <Link href="/mensagens" className="inline-link messages-back">
            <Icon name="back" size={18} /> Todas as conversas
          </Link>
          <div className="chat-heading">
            <div>
              <h2>{worker ? active.employer_name : active.worker_name}</h2>
              <p>{active.title}</p>
            </div>
            <Link href="/atendimento">Pedir apoio</Link>
          </div>
          <div
            className="chat-messages"
            role="log"
            aria-label="Mensagens desta conversa"
            aria-live="polite"
          >
            {state?.messages
              .filter((m) => m.application_id === active.id)
              .map((m) => (
                <div
                  key={m.id}
                  className={`message-bubble ${m.sender_id === state.user?.id ? "outgoing" : "incoming"}`}
                >
                  <span>
                    {m.sender_name} · {displayDate(m.created_at)}
                  </span>
                  <p className="preserve-lines">{m.text}</p>
                </div>
              ))}
            {!state?.messages.some((m) => m.application_id === active.id) && (
              <p className="chat-empty">Comece com uma apresentação.</p>
            )}
          </div>
          {closed ? (
            <p className="muted">
              Conversa encerrada. O histórico continua disponível aos
              participantes.
            </p>
          ) : (
            <MutationForm
              label="Enviar mensagem"
              key={active.id}
              reset
              build={(f) => ({
                action: "message",
                id: active.id,
                text: value(f, "text"),
              })}
            >
              <Field label="Mensagem">
                <textarea
                  name="text"
                  required
                  maxLength={2000}
                  rows={3}
                  placeholder="Escreva sua mensagem…"
                />
              </Field>
              <button className="button primary">
                Enviar mensagem <Icon name="arrow" size={18} />
              </button>
            </MutationForm>
          )}
        </section>
      </div>
    </>
  );
}
export function History() {
  const { state } = useLive();
  const worker = state?.user?.role === "trabalhador";
  return (
    <>
      <Title
        title="Histórico de trabalho"
        description="Veja quais experiências foram confirmadas."
      />
      {worker && (
        <details className="form-card">
          <summary>Adicionar experiência autodeclarada</summary>
          <MutationForm
            reset
            build={(f) => ({
              action: "declareHistory",
              employerName: value(f, "employerName"),
              title: value(f, "title"),
              start: value(f, "start"),
              ...(value(f, "end") ? { end: value(f, "end") } : {}),
            })}
          >
            <Field label="Nome do empregador">
              <input name="employerName" required maxLength={100} />
            </Field>
            <Field label="Função">
              <input name="title" required maxLength={100} />
            </Field>
            <Field label="Início">
              <input
                name="start"
                type="date"
                required
                max={todayInSaoPaulo()}
              />
            </Field>
            <Field label="Fim (opcional)">
              <input name="end" type="date" max={todayInSaoPaulo()} />
            </Field>
            <button className="button secondary">Salvar experiência</button>
          </MutationForm>
        </details>
      )}
      {state?.experiences.length ? (
        state.experiences.map((e) => {
          const mine = e.worker_id === state.user?.id;
          const confirmed =
            e.worker_confirmed && e.employer_confirmed && !e.contested;
          const needsConfirm =
            e.origin === "Plataforma" &&
            !e.contested &&
            !(mine ? e.worker_confirmed : e.employer_confirmed);
          const review = state.reviews.find((r) => r.experience_id === e.id);
          const pendingClosure = e.closure_status === "Pendente";
          const needsClosureResponse =
            pendingClosure &&
            !(mine ? e.closure_worker_confirmed : e.closure_employer_confirmed);
          return (
            <article className="form-card live-record" key={e.id}>
              <div className="history-heading">
                <div>
                  <h2>{e.title}</h2>
                  <div className="history-meta">
                    <span>
                      <Icon name="home" size={16} /> {e.employer_name}
                    </span>
                    <span>
                      <Icon name="clock" size={16} />{" "}
                      {displayDate(e.start_date)} —{" "}
                      {e.end_date ? displayDate(e.end_date) : "Em andamento"}
                    </span>
                  </div>
                </div>
                <Badge tone={confirmed ? "green" : "gray"}>
                  {e.contested
                    ? "Contestada"
                    : confirmed
                      ? "Confirmada pelas duas partes"
                      : e.origin === "Autodeclarado"
                        ? "Autodeclarada"
                        : "Aguardando confirmação"}
                </Badge>
              </div>
              <p className="history-origin">
                {e.origin === "Autodeclarado"
                  ? "Registro pessoal autodeclarado; não confirmado pelo empregador."
                  : "Registro vinculado a uma candidatura na plataforma."}
              </p>
              {needsConfirm && (
                <div className="inline-actions">
                  <ConfirmAction
                    label="Confirmar experiência"
                    title="Confirmar este período de trabalho?"
                    description={`Você confirma o registro de ${e.title} em ${e.employer_name}, com início em ${displayDate(e.start_date)}${e.end_date ? " e fim em " + displayDate(e.end_date) : ", em andamento"}.`}
                    action={{
                      action: "confirmHistory",
                      id: e.id,
                      confirm: true,
                    }}
                  />
                  <ConfirmAction
                    label="Não reconheço esta experiência"
                    title="Contestar este registro?"
                    description="O registro ficará contestado e o sindicato receberá um pedido de apoio. Confira o empregador e as datas antes de continuar."
                    destructive
                    action={{
                      action: "confirmHistory",
                      id: e.id,
                      confirm: false,
                    }}
                  />
                </div>
              )}
              {pendingClosure && (
                <div className="history-pending">
                  <h3>Encerramento aguardando confirmação</h3>
                  <p>
                    Data final proposta: {displayDate(e.closure_end_date!)}. A
                    experiência permanece em andamento até a confirmação.
                  </p>
                  {needsClosureResponse ? (
                    <div className="inline-actions">
                      <ConfirmAction
                        label="Confirmar encerramento"
                        title="Confirmar a data final?"
                        description={`Você confirma que o trabalho em ${e.employer_name} terminou em ${displayDate(e.closure_end_date!)}. O período encerrado ficará registrado após o acordo das partes.`}
                        action={{
                          action: "respondClosure",
                          id: e.closure_id,
                          version: e.version,
                          confirm: true,
                        }}
                      />
                      <ConfirmAction
                        label="Recusar data final"
                        title="A data proposta está incorreta?"
                        description={`A data de ${displayDate(e.closure_end_date!)} será recusada. O período já confirmado permanece em andamento e um pedido de apoio será registrado para o sindicato.`}
                        destructive
                        action={{
                          action: "respondClosure",
                          id: e.closure_id,
                          version: e.version,
                          confirm: false,
                        }}
                      />
                    </div>
                  ) : (
                    <p className="muted">Aguardando resposta da outra parte.</p>
                  )}
                </div>
              )}
              {e.closure_status === "Recusada" && (
                <p className="muted">
                  A data final de {displayDate(e.closure_end_date!)} foi
                  recusada. O período já confirmado foi preservado. Vocês podem
                  propor uma nova data.
                </p>
              )}
              {!e.end_date &&
                !e.contested &&
                !pendingClosure &&
                (confirmed || (mine && e.origin === "Autodeclarado")) && (
                  <MutationForm
                    key={`${e.id}-${e.version}`}
                    label={`Encerrar experiência: ${e.title}`}
                    build={(f) => ({
                      action: "closeExperience",
                      id: e.id,
                      version: e.version,
                      end: value(f, "end"),
                    })}
                  >
                    <Field
                      label="Data final do trabalho"
                      hint={
                        e.origin === "Plataforma"
                          ? "A outra parte precisa confirmar esta data antes da avaliação."
                          : "O registro continuará autodeclarado."
                      }
                    >
                      <input
                        name="end"
                        type="date"
                        required
                        min={e.start_date}
                        max={todayInSaoPaulo()}
                      />
                    </Field>
                    <button className="button secondary">
                      {e.origin === "Plataforma"
                        ? "Propor encerramento"
                        : "Encerrar experiência autodeclarada"}
                    </button>
                  </MutationForm>
                )}
              {mine && confirmed && e.end_date && !review && (
                <MutationForm
                  build={(f) => ({
                    action: "review",
                    id: e.id,
                    rating: Number(value(f, "rating")),
                    text: value(f, "text"),
                  })}
                >
                  <h3>Avaliar esta experiência</h3>
                  <Field label="Nota">
                    <select name="rating">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} de 5
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Como foi trabalhar com este empregador?"
                    hint="Evite nomes de terceiros, contatos, documentos ou informações sensíveis."
                  >
                    <textarea name="text" required maxLength={2000} rows={4} />
                  </Field>
                  <button className="button primary">
                    Enviar avaliação para análise
                  </button>
                </MutationForm>
              )}
              {review && (
                <p>
                  Avaliação: <Badge>{review.status}</Badge>
                </p>
              )}
            </article>
          );
        })
      ) : (
        <Empty
          title="Seu histórico começa aqui"
          description="Registre períodos de trabalho. Confirmações exigem as duas partes."
        />
      )}
    </>
  );
}
export function Reviews({ moderation = false }: { moderation?: boolean }) {
  const { state } = useLive();
  const reviews =
    state?.reviews.filter((r) =>
      moderation
        ? r.status !== "Publicada"
        : r.author_id === state.user?.id ||
          state.employers.some((e) => e.owned && e.id === r.employer_id),
    ) ?? [];
  return (
    <>
      <Title
        title={moderation ? "Análise de avaliações" : "Avaliações e respostas"}
        description="Avaliações exigem experiência encerrada e confirmada."
      />
      {reviews.length ? (
        reviews.map((r) => (
          <article className="form-card live-record" key={r.id}>
            <Badge>{r.status}</Badge>
            <h2>
              {r.employer_name} · {r.rating}/5
            </h2>
            <p className="preserve-lines">{r.text}</p>
            {r.response && (
              <>
                <h3>Resposta do empregador</h3>
                <p className="preserve-lines">{r.response}</p>
              </>
            )}
            {r.moderation_reason && (
              <p className="muted">Moderação: {r.moderation_reason}</p>
            )}
            {moderation ? (
              <MutationForm
                build={(f) => ({
                  action: "moderateReview",
                  id: r.id,
                  status: value(f, "status"),
                  reason: value(f, "reason"),
                })}
              >
                <Field label="Decisão">
                  <select name="status">
                    <option>Publicada</option>
                    <option>Oculta</option>
                  </select>
                </Field>
                <Field label="Fundamentação">
                  <textarea name="reason" rows={3} required maxLength={1000} />
                </Field>
                <button className="button primary">Registrar moderação</button>
              </MutationForm>
            ) : (
              <>
                {state?.employers.some(
                  (e) => e.owned && e.id === r.employer_id,
                ) && (
                  <details>
                    <summary>Responder à avaliação</summary>
                    <MutationForm
                      build={(f) => ({
                        action: "respondReview",
                        id: r.id,
                        text: value(f, "text"),
                      })}
                    >
                      <Field label="Resposta">
                        <textarea
                          name="text"
                          required
                          maxLength={2000}
                          rows={3}
                        />
                      </Field>
                      <button className="button secondary">
                        Enviar resposta para análise
                      </button>
                    </MutationForm>
                  </details>
                )}
                <details>
                  <summary>Contestar avaliação</summary>
                  <MutationForm
                    build={(f) => ({
                      action: "openCase",
                      reviewId: r.id,
                      title: "Contestação de avaliação",
                      detail: value(f, "detail"),
                    })}
                  >
                    <Field label="Motivo da contestação">
                      <textarea
                        name="detail"
                        required
                        maxLength={4000}
                        rows={3}
                      />
                    </Field>
                    <button className="button secondary">
                      Solicitar análise do sindicato
                    </button>
                  </MutationForm>
                </details>
              </>
            )}
          </article>
        ))
      ) : (
        <Empty
          title="Nenhuma avaliação nesta área"
          description="Avaliações aparecerão após a confirmação da experiência."
        />
      )}
    </>
  );
}
export function Cases({ moderation = false }: { moderation?: boolean }) {
  const { state } = useLive();
  return (
    <>
      <Title
        title={moderation ? "Atendimentos do sindicato" : "Meus atendimentos"}
        description="Acompanhe suas solicitações."
      />
      {!moderation && (
        <MutationForm
          reset
          build={(f) => ({
            action: "openCase",
            title: value(f, "title"),
            detail: value(f, "detail"),
            ...(value(f, "applicationId")
              ? { applicationId: value(f, "applicationId") }
              : {}),
          })}
        >
          <Field label="Assunto">
            <input name="title" required maxLength={150} />
          </Field>
          <Field label="Candidatura relacionada (opcional)">
            <select name="applicationId">
              <option value="">Atendimento geral</option>
              {state?.applications.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.title} · {a.employer_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Conte o que aconteceu">
            <textarea name="detail" required maxLength={4000} rows={4} />
          </Field>
          <button className="button primary">Registrar solicitação</button>
        </MutationForm>
      )}
      {state?.cases.map((c) => (
        <article className="form-card live-record" key={c.id}>
          <Badge>{c.status}</Badge>
          <h2>{c.title}</h2>
          <p className="muted">{displayDate(c.created_at)}</p>
          <p className="preserve-lines">{c.detail}</p>
          {c.resolution && (
            <>
              <h3>Retorno do sindicato</h3>
              <p className="preserve-lines">{c.resolution}</p>
            </>
          )}
          {moderation && c.status === "Aberto" && (
            <MutationForm
              build={(f) => ({
                action: "resolveCase",
                id: c.id,
                resolution: value(f, "resolution"),
              })}
            >
              <Field label="Resposta e resolução">
                <textarea
                  name="resolution"
                  required
                  maxLength={4000}
                  rows={4}
                />
              </Field>
              <button className="button primary">Resolver atendimento</button>
            </MutationForm>
          )}
        </article>
      ))}
    </>
  );
}
export function Accounts() {
  const { state } = useLive();
  const [query, setQuery] = useState("");
  const matches = (name: string) =>
    name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));
  return (
    <>
      <Title
        title="Cadastros e acessos"
        description="Verifique documentos. Dígitos válidos não comprovam identidade."
      />
      <div className="accounts-tools">
        <Field label="Pesquisar cadastros">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome da pessoa ou do empregador"
          />
        </Field>
      </div>
      {query &&
        !state?.employers.some((e) => matches(e.name)) &&
        !state?.accounts.some((u) => matches(u.name)) && (
          <Empty
            title="Nenhum cadastro encontrado"
            description="Altere ou limpe a busca."
          />
        )}
      <h2 className="accounts-section-heading">Empregadores</h2>
      {state?.employers
        .filter((e) => matches(e.name))
        .map((e) => (
          <article className="form-card live-record" key={e.id}>
            <h3>{e.name}</h3>
            <p>
              {e.type} · {e.region} ·{" "}
              {e.verified
                ? "Verificado manualmente"
                : "Pendente de verificação"}
            </p>
            <details className="account-actions">
              <summary>Revisar verificação cadastral</summary>
              <MutationForm
                build={(f) => ({
                  action: "verifyProfile",
                  kind: "employer",
                  id: e.id,
                  verified: !e.verified,
                  reason: value(f, "reason"),
                })}
              >
                <Field label="Evidência e motivo da decisão">
                  <input name="reason" required maxLength={1000} />
                </Field>
                <button className="button secondary">
                  {e.verified
                    ? "Remover verificação"
                    : "Registrar verificação manual"}
                </button>
              </MutationForm>
            </details>
          </article>
        ))}
      <h2 className="accounts-section-heading">Contas</h2>
      {state?.accounts
        .filter((u) => matches(u.name))
        .map((u) => (
          <article className="form-card live-record" key={u.id}>
            <h3>{u.name}</h3>
            <p>
              {u.emailVerified ? "E-mail confirmado" : "E-mail pendente"} ·{" "}
              {u.suspended ? "Suspensa" : "Ativa"}
            </p>
            {u.has_person && (
              <details className="account-actions">
                <summary>Revisar verificação do perfil</summary>
                <MutationForm
                  build={(f) => ({
                    action: "verifyProfile",
                    kind: "person",
                    id: u.id,
                    verified: !u.verified,
                    reason: value(f, "reason"),
                  })}
                >
                  <Field label="Evidência e motivo da verificação">
                    <input name="reason" required maxLength={1000} />
                  </Field>
                  <button className="button secondary">
                    {u.verified
                      ? "Remover verificação do perfil"
                      : "Verificar perfil manualmente"}
                  </button>
                </MutationForm>
              </details>
            )}
            <details className="account-actions">
              <summary>
                {u.suspended
                  ? "Restabelecer acesso da conta"
                  : "Alterar acesso da conta"}
              </summary>
              <MutationForm
                build={(f) => ({
                  action: "suspendUser",
                  id: u.id,
                  suspended: !u.suspended,
                  reason: value(f, "reason"),
                })}
              >
                <Field label="Motivo da alteração de acesso">
                  <input name="reason" required maxLength={1000} />
                </Field>
                <p className="small-note">
                  {u.suspended
                    ? "A conta voltará a acessar as áreas permitidas ao seu perfil."
                    : "A suspensão encerra as sessões e bloqueia o acesso desta conta. Registre a fundamentação antes de continuar."}
                </p>
                <label className="checkbox-field">
                  <input type="checkbox" required />
                  Entendo a alteração de acesso para {u.name}.
                </label>
                <button
                  className={`button ${u.suspended ? "secondary" : "destructive"}`}
                >
                  {u.suspended ? "Restabelecer acesso" : "Suspender acesso"}
                </button>
              </MutationForm>
            </details>
          </article>
        ))}
    </>
  );
}
export function Reports() {
  const { notify } = useLive();
  const [from, setFrom] = useState(todayInSaoPaulo().slice(0, 7) + "-01");
  const [to, setTo] = useState(todayInSaoPaulo());
  const [items, setItems] = useState<ReportRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState("");
  const [reportError, setReportError] = useState("");
  const query = new URLSearchParams({ from, to }).toString();
  const period = loaded
    ? `${displayDate(new URLSearchParams(loaded).get("from")!)} a ${displayDate(new URLSearchParams(loaded).get("to")!)}`
    : "";
  return (
    <>
      <Title
        title="Relatórios de empregadores"
        description="Indicadores por período · horário de São Paulo."
      />
      <form
        className="form-card report-query"
        aria-label="Período do relatório"
        aria-busy={busy}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setReportError("");
          try {
            if (from > to)
              throw new Error(
                "A data inicial deve ser anterior ou igual à data final.",
              );
            const response = await fetch(`/api/reports?${query}`, {
              cache: "no-store",
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setItems(result.items);
            setLoaded(query);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Falha no relatório.";
            setReportError(message);
            notify(message, "error");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <Field label="Data inicial">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </Field>
          <Field label="Data final">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </Field>
        </div>
        <button className="button primary" disabled={busy}>
          {busy ? "Gerando relatório…" : "Gerar relatório"}
        </button>
        {loaded === query && (
          <a
            className="button secondary"
            href={`/api/reports?${query}&format=csv`}
          >
            <Icon name="download" size={18} /> Exportar CSV
          </a>
        )}
      </form>
      {reportError && (
        <p className="form-error" role="alert">
          {reportError}
        </p>
      )}
      {items && loaded !== query && (
        <p className="report-state" role="status">
          Filtros alterados. Gere novamente para atualizar os resultados. Os
          dados abaixo correspondem a {period}.
        </p>
      )}
      <details className="report-method">
        <summary>Como interpretar os indicadores</summary>
        <NoticeBox>
          Publicações contam revisões aprovadas no período. Contratações são
          informações de encaminhamento; experiências confirmadas exigem
          concordância das duas partes. As avaliações consideram somente as
          atualmente publicadas.
        </NoticeBox>
      </details>
      {items && (
        <>
          <p className="report-period" role="status">
            <strong>{items.length}</strong> empregador(es) · Período de {period}
          </p>
          {items.length ? (
            <>
              <Stats
                items={[
                  {
                    label: "Publicações aprovadas",
                    value: items.reduce((n, r) => n + r.published, 0),
                    icon: "bag",
                  },
                  {
                    label: "Candidaturas registradas",
                    value: items.reduce((n, r) => n + r.applications, 0),
                    icon: "user",
                  },
                  {
                    label: "Experiências confirmadas",
                    value: items.reduce((n, r) => n + r.confirmed, 0),
                    icon: "check",
                  },
                ]}
              />
              <div className="table-scroll report-table">
                <table>
                  <caption>Indicadores de {period}</caption>
                  <thead>
                    <tr>
                      {[
                        "Empregador",
                        "Tipo",
                        "Região",
                        "Publicações",
                        "Candidaturas",
                        "Contratações informadas",
                        "Experiências confirmadas",
                        "Avaliações",
                        "Média",
                      ].map((t) => (
                        <th key={t} scope="col">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.employer_id}>
                        <th scope="row">{r.name}</th>
                        <td>{r.type}</td>
                        <td>{r.region}</td>
                        <td>{r.published}</td>
                        <td>{r.applications}</td>
                        <td>{r.hires}</td>
                        <td>{r.confirmed}</td>
                        <td>{r.reviews}</td>
                        <td>{r.average?.toFixed(1) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className="report-cards"
                aria-label={`Indicadores por empregador de ${period}`}
              >
                {items.map((r) => (
                  <article className="report-card" key={r.employer_id}>
                    <h2>{r.name}</h2>
                    <p>
                      {r.type === "PF" ? "Pessoa física" : "Pessoa jurídica"} ·{" "}
                      {r.region}
                    </p>
                    <dl>
                      <div>
                        <dt>Publicações aprovadas</dt>
                        <dd>{r.published}</dd>
                      </div>
                      <div>
                        <dt>Candidaturas</dt>
                        <dd>{r.applications}</dd>
                      </div>
                      <div>
                        <dt>Experiências confirmadas</dt>
                        <dd>{r.confirmed}</dd>
                      </div>
                    </dl>
                    <details>
                      <summary>Ver todos os indicadores</summary>
                      <dl>
                        <div>
                          <dt>Contratações informadas</dt>
                          <dd>{r.hires}</dd>
                        </div>
                        <div>
                          <dt>Avaliações publicadas</dt>
                          <dd>{r.reviews}</dd>
                        </div>
                        <div>
                          <dt>Média das avaliações</dt>
                          <dd>{r.average?.toFixed(1) ?? "Sem avaliações"}</dd>
                        </div>
                      </dl>
                    </details>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <Empty
              title="Nenhum registro neste período"
              description="Selecione outro período."
            />
          )}
        </>
      )}
    </>
  );
}
