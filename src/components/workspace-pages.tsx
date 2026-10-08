"use client";

import Link from "@/demo/navigation";
import { useRouter } from "@/demo/navigation";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/demo/provider";
import {
  categories,
  regions,
  money,
  type Application,
  type ApplicationStatus,
  type Job,
  type Role,
} from "@/demo/data";
import { Icon } from "./icon";
import {
  ActionLink,
  Avatar,
  Badge,
  Empty,
  Field,
  NoticeBox,
  Stats,
  Title,
} from "./ui";

const roleLabels: Record<Role, string> = {
  trabalhador: "Área do trabalhador",
  empregador: "Área do empregador",
  sindicato: "Painel do sindicato",
};
const links: Record<Role, { href: string; label: string; icon: string }[]> = {
  trabalhador: [
    { href: "/trabalhador", label: "Meu espaço", icon: "home" },
    { href: "/vagas", label: "Encontrar trabalho", icon: "search" },
    { href: "/trabalhador/candidaturas", label: "Candidaturas", icon: "bag" },
    { href: "/mensagens", label: "Mensagens", icon: "chat" },
    { href: "/trabalhador/historico", label: "Histórico", icon: "clock" },
    { href: "/trabalhador/perfil", label: "Meu perfil", icon: "user" },
  ],
  empregador: [
    { href: "/empregador", label: "Minhas vagas", icon: "bag" },
    {
      href: "/empregador/vagas/nova",
      label: "Nova oportunidade",
      icon: "plus",
    },
    { href: "/mensagens", label: "Mensagens", icon: "chat" },
    { href: "/empregador/cadastro", label: "Meu cadastro", icon: "user" },
  ],
  sindicato: [
    { href: "/sindicato", label: "Análise de vagas", icon: "shield" },
    { href: "/sindicato/empregadores", label: "Empregadores", icon: "home" },
    { href: "/sindicato/atendimentos", label: "Atendimentos", icon: "chat" },
    { href: "/sindicato/relatorios", label: "Relatórios", icon: "chart" },
    { href: "/sindicato/equipe", label: "Equipe", icon: "user" },
  ],
};

export function WorkspacePage({ path }: { path: string }) {
  const { state } = useDemo();
  const role = state.role!;
  const activeName =
    role === "trabalhador"
      ? state.profile.name
      : role === "empregador"
        ? state.employer.name
        : "Equipe de demonstração";
  let content: React.ReactNode;
  if (path === "/trabalhador") content = <WorkerDashboard />;
  else if (path === "/trabalhador/perfil") content = <ProfileForm />;
  else if (path === "/trabalhador/candidaturas") content = <ApplicationsPage />;
  else if (path === "/trabalhador/historico") content = <HistoryPage />;
  else if (path === "/empregador") content = <EmployerDashboard />;
  else if (path === "/empregador/cadastro") content = <EmployerProfile />;
  else if (path === "/empregador/vagas/nova") content = <JobForm key="new" />;
  else if (/^\/empregador\/vagas\/[^/]+\/candidaturas$/.test(path))
    content = <CandidatesPage id={path.split("/")[3]} />;
  else if (/^\/empregador\/vagas\/[^/]+$/.test(path))
    content = <JobForm key={path.split("/")[3]} id={path.split("/")[3]} />;
  else if (path === "/sindicato") content = <UnionDashboard />;
  else if (/^\/sindicato\/vagas\/[^/]+$/.test(path))
    content = <ModerationPage id={path.split("/")[3]} />;
  else if (path === "/sindicato/empregadores") content = <EmployersPage />;
  else if (path === "/sindicato/atendimentos") content = <CasesPage />;
  else if (path === "/sindicato/relatorios") content = <ReportsPage />;
  else if (path === "/sindicato/equipe") content = <TeamPage />;
  else if (path === "/mensagens" || /^\/mensagens\/[^/]+$/.test(path))
    content = <MessagesPage selected={path.split("/")[2]} />;
  else
    content = (
      <Empty
        title="Esta área não foi encontrada"
        description="Use a navegação para continuar explorando."
      />
    );
  return (
    <div className="workspace-background">
      <div className="container workspace-layout">
        <aside className="workspace-sidebar">
          <div className="sidebar-profile">
            <Avatar name={activeName} large />
            <strong>{activeName}</strong>
            <span>{roleLabels[role]}</span>
          </div>
          <nav aria-label={roleLabels[role]}>
            {links[role].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  path === link.href ||
                  (link.href !== `/${role}` && path.startsWith(link.href + "/"))
                    ? "active"
                    : ""
                }
                aria-current={path === link.href ? "page" : undefined}
              >
                <Icon name={link.icon} size={19} />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-help">
            <Icon name="leaf" size={27} />
            <p>
              Um passo de cada vez.
              <br />
              Estamos construindo juntos.
            </p>
            <Link href="/entrar">
              Trocar perfil de demonstração <Icon name="arrow" size={15} />
            </Link>
          </div>
        </aside>
        <div className="workspace-content">{content}</div>
      </div>
    </div>
  );
}

function WorkerDashboard() {
  const { state } = useDemo();
  const applications = state.applications.filter(
    (a) => a.workerId === "demo-worker",
  );
  return (
    <>
      <Title
        eyebrow="BOM TER VOCÊ POR AQUI"
        title={`Olá, ${state.profile.name.split(" ")[0]}.`}
        description="Seu próximo capítulo começa com um passo. Acompanhe o que está acontecendo."
        action={
          <ActionLink href="/vagas" small>
            Encontrar trabalho
            <Icon name="arrow" size={17} />
          </ActionLink>
        }
      />
      <Stats
        items={[
          {
            label: "Candidaturas de exemplo",
            value: applications.length,
            icon: "bag",
          },
          {
            label: "Conversas disponíveis",
            value: applications.filter(
              (a) => !["Desistiu", "Não selecionada"].includes(a.status),
            ).length,
            icon: "chat",
          },
          {
            label: "Experiências registradas",
            value: state.experiences.length,
            icon: "clock",
          },
        ]}
      />
      <div className="welcome-panel">
        <span className="welcome-icon">
          <Icon name="leaf" size={46} />
        </span>
        <div>
          <h2>Seu perfil conta sua história.</h2>
          <p>
            Mantenha suas experiências e disponibilidade em dia para começar
            boas conversas.
          </p>
          <Link href="/trabalhador/perfil" className="inline-link">
            Revisar meu perfil
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
      <div className="panel-heading">
        <h2>Seus últimos passos</h2>
        <Link href="/trabalhador/candidaturas" className="inline-link">
          Ver candidaturas
        </Link>
      </div>
      {applications.length ? (
        <div className="record-list">
          {applications
            .slice(-3)
            .reverse()
            .map((a) => (
              <ApplicationRow key={a.id} application={a} />
            ))}
        </div>
      ) : (
        <Empty
          title="Sua primeira oportunidade espera por você"
          description="Explore as vagas de exemplo para conhecer o fluxo de candidatura."
        >
          <ActionLink href="/vagas">Buscar oportunidades</ActionLink>
        </Empty>
      )}
    </>
  );
}

function ApplicationRow({ application }: { application: Application }) {
  const { state, setState, notify } = useDemo();
  const job = state.jobs.find((j) => j.id === application.jobId);
  return (
    <article className="record-card">
      <div className="record-top">
        <div>
          <p className="eyebrow">{job?.category}</p>
          <h3>{job?.title || "Vaga de exemplo"}</h3>
          <p className="muted">
            {job?.employer} · versão {application.revision} na candidatura
          </p>
        </div>
        <Badge>{application.status}</Badge>
      </div>
      {job && job.status !== "Publicada" && (
        <p className="small-note">
          Esta vaga está {job.status.toLowerCase()}. Sua candidatura foi
          preservada.
        </p>
      )}
      <div className="record-actions">
        {!["Desistiu", "Não selecionada"].includes(application.status) && (
          <ActionLink href={`/mensagens/${application.id}`} secondary small>
            Conversar
            <Icon name="chat" size={16} />
          </ActionLink>
        )}
        {!["Desistiu", "Não selecionada", "Contratação informada"].includes(
          application.status,
        ) && (
          <button
            className="text-button"
            onClick={() => {
              setState((prev) => ({
                ...prev,
                applications: prev.applications.map((a) =>
                  a.id === application.id ? { ...a, status: "Desistiu" } : a,
                ),
              }));
              notify("Desistência registrada na candidatura de exemplo.");
            }}
          >
            Desistir da candidatura
          </button>
        )}
      </div>
    </article>
  );
}

function ApplicationsPage() {
  const { state } = useDemo();
  const [status, setStatus] = useState("");
  const applications = state.applications.filter(
    (a) => a.workerId === "demo-worker" && (!status || a.status === status),
  );
  return (
    <>
      <Title
        eyebrow="ACOMPANHE SEU CAMINHO"
        title="Minhas candidaturas"
        description="Saiba em que etapa está cada conversa e escolha seus próximos passos."
      />
      <Field label="Filtrar por situação">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todas as situações</option>
          {[
            "Enviada",
            "Em análise",
            "Contato iniciado",
            "Proposta enviada",
            "Contratação informada",
            "Não selecionada",
            "Desistiu",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <div className="record-list">
        {applications.length ? (
          applications.map((a) => <ApplicationRow key={a.id} application={a} />)
        ) : (
          <Empty
            title="Nenhuma candidatura nesta situação"
            description="Explore outras situações ou encontre uma nova oportunidade."
          >
            <ActionLink href="/vagas">Ver oportunidades</ActionLink>
          </Empty>
        )}
      </div>
    </>
  );
}

function ProfileForm() {
  const { state, setState, notify } = useDemo();
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name"));
    setState((prev) => ({
      ...prev,
      profile: {
        name,
        region: String(d.get("region")),
        category: String(d.get("category")),
        availability: String(d.get("availability")),
        bio: String(d.get("bio")),
      },
      applications: prev.applications.map((a) =>
        a.workerId === "demo-worker" ? { ...a, worker: name } : a,
      ),
    }));
    notify("Perfil de exemplo atualizado nesta sessão.");
  }
  return (
    <>
      <Title
        eyebrow="SUA HISTÓRIA TEM VALOR"
        title="Meu perfil profissional"
        description="Use somente dados inventados para experimentar este formulário."
      />
      <form onSubmit={save} className="form-card">
        <div className="profile-form-heading">
          <Avatar name={state.profile.name} large />
          <div>
            <h2>Seu jeito de trabalhar</h2>
            <p className="muted">
              Uma apresentação simples já é um bom começo.
            </p>
          </div>
        </div>
        <Field label="Nome de exemplo">
          <input
            name="name"
            defaultValue={state.profile.name}
            required
            minLength={3}
            maxLength={80}
          />
        </Field>
        <div className="form-grid">
          <Field label="Função principal">
            <select name="category" defaultValue={state.profile.category}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Região de preferência">
            <select name="region" defaultValue={state.profile.region}>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Disponibilidade">
          <input
            name="availability"
            defaultValue={state.profile.availability}
            required
            maxLength={100}
          />
        </Field>
        <Field label="Conte um pouco sobre sua experiência">
          <textarea
            name="bio"
            defaultValue={state.profile.bio}
            rows={4}
            maxLength={1000}
          />
        </Field>
        <Field
          label="CPF de demonstração"
          hint="Consulta cadastral não realizada. O documento não aparece nas vagas."
        >
          <input value="CPF-DEMO" readOnly />
        </Field>
        <button className="button primary" type="submit">
          Salvar perfil de exemplo
          <Icon name="check" size={18} />
        </button>
      </form>
    </>
  );
}

function EmployerDashboard() {
  const { state, setState, notify } = useDemo();
  const [status, setStatus] = useState("");
  const ownJobs = state.jobs.filter((j) => j.owned);
  const jobs = ownJobs.filter((j) => !status || j.status === status);
  function close(job: Job) {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: "Encerrada",
              reason: "Encerramento solicitado na demonstração.",
            }
          : j,
      ),
    }));
    notify(
      "Vaga de exemplo encerrada. Candidaturas existentes foram preservadas.",
    );
  }
  return (
    <>
      <Title
        eyebrow="OPORTUNIDADES QUE VOCÊ CRIA"
        title="Minhas vagas"
        description="Organize suas oportunidades e acompanhe a análise do sindicato."
        action={
          <ActionLink href="/empregador/vagas/nova" small>
            <Icon name="plus" size={17} />
            Nova vaga
          </ActionLink>
        }
      />
      <Stats
        items={[
          {
            label: "Vagas publicadas",
            value: ownJobs.filter((j) => j.status === "Publicada").length,
            icon: "bag",
          },
          {
            label: "Aguardando análise",
            value: ownJobs.filter((j) => j.status === "Pendente").length,
            icon: "clock",
          },
          {
            label: "Candidaturas recebidas",
            value: state.applications.filter((a) =>
              ownJobs.some((j) => j.id === a.jobId),
            ).length,
            icon: "user",
          },
        ]}
      />
      <Field label="Situação da vaga">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todas as situações</option>
          {[
            "Publicada",
            "Pendente",
            "Ajustes solicitados",
            "Rejeitada",
            "Suspensa",
            "Encerrada",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <div className="record-list">
        {jobs.map((job) => (
          <article key={job.id} className="record-card">
            <div className="record-top">
              <div>
                <p className="eyebrow">{job.category}</p>
                <h3>{job.title}</h3>
                <p className="muted">
                  {job.region} · {money(job.salary)} / {job.period} · versão{" "}
                  {job.revision}
                </p>
              </div>
              <Badge>{job.status}</Badge>
            </div>
            {job.reason && (
              <p className="moderation-note">Retorno: {job.reason}</p>
            )}
            <div className="record-actions">
              <ActionLink
                href={`/empregador/vagas/${job.id}/candidaturas`}
                secondary
                small
              >
                Ver candidaturas
              </ActionLink>
              {job.status !== "Encerrada" && (
                <>
                  <Link
                    href={`/empregador/vagas/${job.id}`}
                    className="inline-link"
                  >
                    Editar vaga
                  </Link>
                  <button
                    className="text-button danger"
                    onClick={() => close(job)}
                  >
                    Encerrar vaga
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
        {!jobs.length && (
          <Empty
            title="Nenhuma vaga nesta situação"
            description="Mude o filtro ou crie uma nova oportunidade."
          >
            <ActionLink href="/empregador/vagas/nova">Criar vaga</ActionLink>
          </Empty>
        )}
      </div>
    </>
  );
}

function EmployerProfile() {
  const { state, setState, notify } = useDemo();
  const [type, setType] = useState(state.employer.type);
  return (
    <>
      <Title
        eyebrow="RELAÇÕES COMEÇAM COM CLAREZA"
        title="Meu cadastro de empregador"
        description="Pessoa física ou jurídica: os dados permanecem privados na proposta do sistema."
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const name = String(d.get("name"));
          setState((prev) => ({
            ...prev,
            employer: { name, type, region: String(d.get("region")) },
            jobs: prev.jobs.map((j) =>
              j.owned ? { ...j, employer: name } : j,
            ),
          }));
          notify("Cadastro do empregador atualizado na demonstração.");
        }}
      >
        <Field label="Tipo de empregador">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PF" | "PJ")}
          >
            <option value="PF">Pessoa física — CPF</option>
            <option value="PJ">Pessoa jurídica — CNPJ</option>
          </select>
        </Field>
        <Field label="Nome de exibição de exemplo">
          <input
            name="name"
            defaultValue={state.employer.name}
            required
            minLength={3}
            maxLength={80}
          />
        </Field>
        <Field
          label={type === "PF" ? "CPF de demonstração" : "CNPJ de demonstração"}
          hint="Consulta cadastral não realizada."
        >
          <input readOnly value={type === "PF" ? "CPF-DEMO" : "CNPJ-DEMO"} />
        </Field>
        <Field label="Região">
          <select name="region" defaultValue={state.employer.region}>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <NoticeBox>
          O tipo de cadastro não define, por si só, a natureza jurídica de uma
          relação de trabalho. As vagas elegíveis serão validadas pelo
          sindicato.
        </NoticeBox>
        <button className="button primary" type="submit">
          Salvar cadastro de exemplo
        </button>
      </form>
    </>
  );
}

function JobForm({ id }: { id?: string }) {
  const { state, setState, notify } = useDemo();
  const router = useRouter();
  const existing = state.jobs.find((j) => j.id === id && j.owned);
  const [review, setReview] = useState(false);
  const [draft, setDraft] = useState({
    title: existing?.title || "",
    category: existing?.category || categories[0],
    region: existing?.region || state.employer.region,
    salary: existing?.salary.toString() || "",
    period: existing?.period || "mês",
    schedule: existing?.schedule || "Segunda a sexta",
    hours: existing?.hours || "",
    description: existing?.description || "",
    benefits: existing?.benefits || "",
  });
  if (id && (!existing || existing.status === "Encerrada"))
    return (
      <Empty
        title="Não é possível editar esta vaga"
        description="A vaga não pertence ao perfil de exemplo ou foi encerrada."
      >
        <ActionLink href="/empregador">Voltar às minhas vagas</ActionLink>
      </Empty>
    );
  function update(field: keyof typeof draft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!review) {
      setReview(true);
      return;
    }
    const job: Job = {
      ...draft,
      salary: Number(draft.salary),
      period: draft.period as "mês" | "dia",
      id: id || `vaga-${crypto.randomUUID()}`,
      employer: state.employer.name,
      status: "Pendente",
      owned: true,
      revision: existing ? existing.revision + 1 : 1,
      date: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      jobs: existing
        ? prev.jobs.map((j) => (j.id === id ? job : j))
        : [...prev.jobs, job],
    }));
    notify(
      "Vaga de exemplo enviada para análise sindical. Ela ainda não aparece na busca.",
    );
    router.push("/empregador");
  }
  return (
    <>
      <Title
        eyebrow="UM CONVITE PARA UMA BOA RELAÇÃO"
        title={id ? "Editar oportunidade" : "Publicar uma oportunidade"}
        description="Informe as condições com clareza. O sindicato analisa a vaga antes de publicá-la."
      />
      <form className="form-card" onSubmit={submit}>
        {review ? (
          <>
            <p className="eyebrow">PASSO 2 DE 2 · REVISÃO</p>
            <h2>{draft.title}</h2>
            <dl className="summary-list">
              <dt>Função</dt>
              <dd>{draft.category}</dd>
              <dt>Região</dt>
              <dd>{draft.region}</dd>
              <dt>Remuneração</dt>
              <dd>
                {money(Number(draft.salary))} / {draft.period}
              </dd>
              <dt>Jornada</dt>
              <dd>
                {draft.schedule} · {draft.hours}
              </dd>
              <dt>Atividades</dt>
              <dd>{draft.description}</dd>
              <dt>Benefícios</dt>
              <dd>{draft.benefits}</dd>
            </dl>
            <NoticeBox>
              Regras de demonstração · versão 0: informar condições claras e
              respeitar o processo de análise. Este texto não substitui os
              termos oficiais do sindicato.
            </NoticeBox>
            <label className="checkbox-label">
              <input type="checkbox" required />
              Li as regras de demonstração e entendo que a vaga aguardará
              análise.
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setReview(false)}
              >
                Voltar e editar
              </button>
              <button type="submit" className="button primary">
                Enviar para análise
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">PASSO 1 DE 2 · CONDIÇÕES DA VAGA</p>
            {existing?.status === "Publicada" && (
              <NoticeBox>
                Ao enviar alterações, esta vaga sai temporariamente da busca e
                passa por nova análise. As candidaturas anteriores são
                preservadas.
              </NoticeBox>
            )}
            <Field label="Título da oportunidade">
              <input
                required
                minLength={5}
                maxLength={120}
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Ex.: Apoio na rotina da casa"
              />
            </Field>
            <div className="form-grid">
              <Field label="Função">
                <select
                  value={draft.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Região">
                <select
                  value={draft.region}
                  onChange={(e) => update("region", e.target.value)}
                >
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Remuneração (R$)">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="0.01"
                  required
                  value={draft.salary}
                  onChange={(e) => update("salary", e.target.value)}
                />
              </Field>
              <Field label="Periodicidade">
                <select
                  value={draft.period}
                  onChange={(e) => update("period", e.target.value)}
                >
                  <option value="mês">Por mês</option>
                  <option value="dia">Por dia</option>
                </select>
              </Field>
              <Field label="Jornada">
                <select
                  value={draft.schedule}
                  onChange={(e) => update("schedule", e.target.value)}
                >
                  <option>Segunda a sexta</option>
                  <option>Duas diárias por semana</option>
                  <option>A combinar</option>
                </select>
              </Field>
              <Field label="Horários e intervalos">
                <input
                  required
                  maxLength={120}
                  value={draft.hours}
                  onChange={(e) => update("hours", e.target.value)}
                  placeholder="Informe horários e intervalo"
                />
              </Field>
            </div>
            <Field label="Atividades e responsabilidades">
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
            <Field label="Benefícios e outras condições">
              <textarea
                required
                minLength={3}
                maxLength={1000}
                rows={2}
                value={draft.benefits}
                onChange={(e) => update("benefits", e.target.value)}
              />
            </Field>
            <p className="small-note">
              Não informe endereço completo ou dados pessoais. Valores são
              apenas exemplos, sujeitos à análise.
            </p>
            <button className="button primary" type="submit">
              Revisar oportunidade
              <Icon name="arrow" size={18} />
            </button>
          </>
        )}
      </form>
    </>
  );
}

const nextStatus: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  Enviada: "Em análise",
  "Em análise": "Contato iniciado",
  "Contato iniciado": "Proposta enviada",
  "Proposta enviada": "Contratação informada",
};
const nextLabel: Record<string, string> = {
  "Em análise": "Analisar candidatura",
  "Contato iniciado": "Iniciar contato",
  "Proposta enviada": "Registrar proposta",
  "Contratação informada": "Informar contratação",
};

function CandidatesPage({ id }: { id: string }) {
  const { state, setState, notify } = useDemo();
  const job = state.jobs.find((j) => j.id === id && j.owned);
  if (!job)
    return (
      <Empty
        title="Vaga não encontrada neste perfil"
        description="Consulte suas próprias vagas de demonstração."
      />
    );
  const applications = state.applications.filter((a) => a.jobId === id);
  function advance(application: Application, status: ApplicationStatus) {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === application.id ? { ...a, status } : a,
      ),
      experiences:
        status === "Contratação informada" &&
        application.workerId === "demo-worker"
          ? [
              ...prev.experiences,
              {
                id: `exp-${application.id}`,
                employer: job!.employer,
                title: job!.category,
                date: "Início informado na demonstração",
                confirmed: false,
                ended: false,
              },
            ]
          : prev.experiences,
    }));
    notify(
      status === "Contratação informada"
        ? "Contratação informada no exemplo. O vínculo ainda precisa de confirmação do trabalhador."
        : "Andamento da candidatura de exemplo atualizado.",
    );
  }
  return (
    <>
      <Link className="back-link" href="/empregador">
        <Icon name="back" size={17} />
        Minhas vagas
      </Link>
      <Title
        eyebrow="BOAS CONVERSAS COMEÇAM AQUI"
        title="Candidaturas recebidas"
        description={job.title}
      />
      <div className="record-list">
        {applications.length ? (
          applications.map((a) => (
            <article key={a.id} className="record-card">
              <div className="record-top">
                <div className="candidate-header">
                  <Avatar name={a.worker} />
                  <div>
                    <h3>{a.worker}</h3>
                    <p className="muted">
                      Candidatura à versão {a.revision} da vaga
                    </p>
                  </div>
                </div>
                <Badge>{a.status}</Badge>
              </div>
              <div className="record-actions">
                {nextStatus[a.status] && (
                  <button
                    className="button primary small"
                    onClick={() => advance(a, nextStatus[a.status]!)}
                  >
                    {nextLabel[nextStatus[a.status]!]}
                  </button>
                )}
                {!["Desistiu", "Não selecionada"].includes(a.status) && (
                  <ActionLink href={`/mensagens/${a.id}`} secondary small>
                    Conversar
                  </ActionLink>
                )}
                {nextStatus[a.status] && (
                  <button
                    className="text-button"
                    onClick={() => advance(a, "Não selecionada")}
                  >
                    Não selecionar
                  </button>
                )}
              </div>
              {a.status === "Contratação informada" && (
                <p className="small-note">
                  Declaração do empregador, sem comprovação automática de
                  vínculo.
                </p>
              )}
            </article>
          ))
        ) : (
          <Empty
            title="As próximas conversas começam aqui"
            description="Depois da aprovação, trabalhadores poderão se candidatar a esta oportunidade."
          />
        )}
      </div>
    </>
  );
}

function UnionDashboard() {
  const { state } = useDemo();
  const [status, setStatus] = useState("Pendente");
  const jobs = state.jobs.filter((j) => !status || j.status === status);
  return (
    <>
      <Title
        eyebrow="CUIDAR DAS CONEXÕES"
        title="Cada oportunidade merece atenção."
        description="Analise as condições registradas antes de aproximar trabalhadores e contratantes."
      />
      <Stats
        items={[
          {
            label: "Vagas para analisar",
            value: state.jobs.filter((j) => j.status === "Pendente").length,
            icon: "clock",
          },
          {
            label: "Vagas publicadas",
            value: state.jobs.filter((j) => j.status === "Publicada").length,
            icon: "bag",
          },
          {
            label: "Atendimentos abertos",
            value: state.cases.filter((c) => c.status === "Aberto").length,
            icon: "chat",
          },
        ]}
      />
      <div className="panel-heading">
        <h2>Fila de análise</h2>
        <Field label="Situação">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas as situações</option>
            {[
              "Pendente",
              "Publicada",
              "Ajustes solicitados",
              "Rejeitada",
              "Suspensa",
              "Encerrada",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="record-list">
        {jobs.map((job) => (
          <article className="record-card" key={job.id}>
            <div className="record-top">
              <div>
                <p className="eyebrow">
                  {job.category} · VERSÃO {job.revision}
                </p>
                <h3>{job.title}</h3>
                <p className="muted">
                  {job.employer} · {job.region}
                </p>
              </div>
              <Badge>{job.status}</Badge>
            </div>
            <div className="record-actions">
              <ActionLink href={`/sindicato/vagas/${job.id}`} secondary small>
                {job.status === "Pendente"
                  ? "Analisar condições"
                  : "Ver detalhes"}
                <Icon name="arrow" size={16} />
              </ActionLink>
            </div>
          </article>
        ))}
        {!jobs.length && (
          <Empty
            title="Tudo em dia nesta fila"
            description="Nenhuma vaga de exemplo corresponde à situação selecionada."
          />
        )}
      </div>
    </>
  );
}

function ModerationPage({ id }: { id: string }) {
  const { state, setState, notify } = useDemo();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const job = state.jobs.find((j) => j.id === id);
  if (!job)
    return (
      <Empty
        title="Vaga não encontrada"
        description="Volte para a fila de análise."
      />
    );
  function decide(status: Job["status"]) {
    if (status !== "Publicada" && reason.trim().length < 5) {
      setError(
        "Informe um motivo com pelo menos 5 caracteres para orientar o empregador.",
      );
      return;
    }
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              status,
              reason: reason.trim() || "Condições analisadas na demonstração.",
            }
          : j,
      ),
    }));
    notify(
      status === "Publicada"
        ? "Vaga de exemplo aprovada e disponível na busca."
        : `Decisão de demonstração registrada: ${status.toLowerCase()}.`,
    );
    router.push("/sindicato");
  }
  return (
    <>
      <Link href="/sindicato" className="back-link">
        <Icon name="back" size={17} />
        Voltar para a fila
      </Link>
      <Title
        eyebrow={`REVISÃO ${job.revision} · ${job.employer.toUpperCase()}`}
        title={job.title}
        action={<Badge>{job.status}</Badge>}
      />
      <article className="form-card">
        <dl className="summary-list">
          <dt>Função</dt>
          <dd>{job.category}</dd>
          <dt>Região</dt>
          <dd>{job.region}</dd>
          <dt>Remuneração</dt>
          <dd>
            {money(job.salary)} / {job.period}
          </dd>
          <dt>Jornada</dt>
          <dd>
            {job.schedule} · {job.hours}
          </dd>
          <dt>Atividades</dt>
          <dd>{job.description}</dd>
          <dt>Benefícios</dt>
          <dd>{job.benefits}</dd>
        </dl>
        <NoticeBox>
          Revisão manual simulada. Piso salarial, enquadramento e demais regras
          precisam de fontes e vigência definidas pelo sindicato. Não há
          validação jurídica automática.
        </NoticeBox>
        {["Pendente", "Publicada"].includes(job.status) && (
          <>
            <Field label="Motivo ou orientação para o empregador">
              <textarea
                rows={3}
                maxLength={1000}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "moderation-error" : undefined}
                placeholder="Explique com clareza o que precisa ser ajustado."
              />
            </Field>
            {error && (
              <p id="moderation-error" className="error-text" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              {job.status === "Pendente" ? (
                <>
                  <button
                    className="button primary"
                    onClick={() => decide("Publicada")}
                  >
                    Aprovar e publicar
                    <Icon name="check" size={18} />
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => decide("Ajustes solicitados")}
                  >
                    Solicitar ajustes
                  </button>
                  <button
                    className="text-button danger"
                    onClick={() => decide("Rejeitada")}
                  >
                    Rejeitar vaga
                  </button>
                </>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => decide("Suspensa")}
                >
                  Suspender publicação
                </button>
              )}
            </div>
          </>
        )}
        {job.reason && (
          <p className="moderation-note">Último retorno: {job.reason}</p>
        )}
      </article>
    </>
  );
}

function MessagesPage({ selected }: { selected?: string }) {
  const { state, setState, notify } = useDemo();
  const router = useRouter();
  const [text, setText] = useState("");
  const applications = state.applications
    .filter((a) =>
      state.role === "trabalhador"
        ? a.workerId === "demo-worker"
        : state.jobs.some((j) => j.id === a.jobId && j.owned),
    )
    .filter((a) => !["Desistiu", "Não selecionada"].includes(a.status));
  const active = selected
    ? applications.find((a) => a.id === selected)
    : applications[0];
  const job = active && state.jobs.find((j) => j.id === active.jobId);
  if (!active)
    return (
      <>
        <Title eyebrow="CONVERSAS COM RESPEITO" title="Mensagens" />
        <Empty
          title={
            selected
              ? "Conversa indisponível neste perfil"
              : "Um diálogo começa com uma candidatura"
          }
          description="Este espaço reúne apenas conversas dos participantes de cada candidatura."
        >
          <ActionLink
            href={state.role === "trabalhador" ? "/vagas" : "/empregador"}
          >
            Continuar explorando
          </ActionLink>
        </Empty>
      </>
    );
  function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: crypto.randomUUID(),
          applicationId: active!.id,
          sender: prev.role!,
          text: text.trim(),
        },
      ],
    }));
    setText("");
  }
  return (
    <>
      <Title
        eyebrow="ESCUTA E DIÁLOGO"
        title="Vamos conversar."
        description="Mensagens de demonstração, visíveis somente no contexto deste navegador."
      />
      <div className="messages-layout">
        <nav className="conversation-list" aria-label="Conversas">
          {applications.map((a) => (
            <button
              key={a.id}
              className={active.id === a.id ? "selected" : ""}
              onClick={() => {
                setText("");
                router.push(`/mensagens/${a.id}`);
              }}
            >
              <Avatar
                name={
                  state.role === "trabalhador"
                    ? state.jobs.find((j) => j.id === a.jobId)?.employer ||
                      "Exemplo"
                    : a.worker
                }
              />
              <span>
                <strong>
                  {state.role === "trabalhador"
                    ? state.jobs.find((j) => j.id === a.jobId)?.employer
                    : a.worker}
                </strong>
                <small>
                  {state.jobs.find((j) => j.id === a.jobId)?.category}
                </small>
              </span>
            </button>
          ))}
        </nav>
        <section className="chat-panel">
          <div className="chat-heading">
            <div>
              <h2>
                {state.role === "trabalhador" ? job?.employer : active.worker}
              </h2>
              <p>{job?.category}</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  cases: [
                    ...prev.cases,
                    {
                      id: crypto.randomUUID(),
                      title: "Denúncia de conversa · exemplo",
                      detail: `Solicitação de análise da candidatura ${active.id}. Conteúdo fictício.`,
                      status: "Aberto",
                    },
                  ],
                }));
                notify(
                  "Solicitação de atendimento registrada na demonstração, sem envio externo.",
                );
              }}
            >
              Pedir apoio
            </button>
          </div>
          <div
            className="chat-messages"
            role="log"
            aria-label="Mensagens desta conversa"
            aria-live="polite"
          >
            {state.messages.filter((m) => m.applicationId === active.id)
              .length ? (
              state.messages
                .filter((m) => m.applicationId === active.id)
                .map((m) => (
                  <div
                    key={m.id}
                    className={`message-bubble ${m.sender === state.role ? "outgoing" : "incoming"}`}
                  >
                    <span>
                      {m.sender === "trabalhador"
                        ? "Trabalhador"
                        : "Empregador"}{" "}
                      · exemplo
                    </span>
                    <p>{m.text}</p>
                  </div>
                ))
            ) : (
              <p className="chat-empty">
                Comece com uma apresentação. Uma boa conversa faz diferença.
              </p>
            )}
          </div>
          <form className="message-form" onSubmit={send}>
            <label>
              <span className="sr-only">Mensagem de exemplo</span>
              <textarea
                required
                maxLength={1000}
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva uma mensagem fictícia…"
              />
            </label>
            <button
              className="button primary"
              type="submit"
              aria-label="Enviar mensagem de exemplo"
            >
              <Icon name="arrow" size={20} />
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

function HistoryPage() {
  const { state, setState, notify } = useDemo();
  const [ratingFor, setRatingFor] = useState("");
  const [adding, setAdding] = useState(false);
  return (
    <>
      <Title
        eyebrow="EXPERIÊNCIAS QUE CONTAM"
        title="Minha trajetória"
        description="Cada experiência faz parte da sua história. A origem e a confirmação ficam sempre claras."
        action={
          <button
            className="button secondary small"
            onClick={() => setAdding(!adding)}
          >
            <Icon name="plus" size={17} />
            Registrar experiência
          </button>
        }
      />
      {adding && (
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            setState((prev) => ({
              ...prev,
              experiences: [
                ...prev.experiences,
                {
                  id: crypto.randomUUID(),
                  employer: String(d.get("employer")),
                  title: String(d.get("title")),
                  date: String(d.get("period")),
                  confirmed: false,
                  ended: true,
                },
              ],
            }));
            setAdding(false);
            notify(
              "Experiência autodeclarada de exemplo adicionada. Ela não habilita avaliação automaticamente.",
            );
          }}
        >
          <h2>Experiência autodeclarada</h2>
          <Field label="Empregador de exemplo">
            <input name="employer" required maxLength={100} />
          </Field>
          <Field label="Função de exemplo">
            <input name="title" required maxLength={100} />
          </Field>
          <Field label="Período de exemplo">
            <input
              name="period"
              placeholder="Ex.: Jan. 2024 — Dez. 2024"
              required
              maxLength={100}
            />
          </Field>
          <button className="button primary" type="submit">
            Salvar experiência de exemplo
          </button>
        </form>
      )}
      <div className="record-list">
        {state.experiences.map((exp) => (
          <article className="record-card" key={exp.id}>
            <div className="record-top">
              <div>
                <p className="eyebrow">{exp.date}</p>
                <h3>{exp.title}</h3>
                <p className="muted">{exp.employer}</p>
              </div>
              <Badge tone={exp.confirmed ? "green" : "amber"}>
                {exp.confirmed
                  ? "Confirmada pelas partes"
                  : exp.id.startsWith("exp-cand")
                    ? "Aguardando confirmação"
                    : "Autodeclarada"}
              </Badge>
            </div>
            {!exp.confirmed && exp.id.startsWith("exp-cand") && (
              <div className="record-actions">
                <button
                  className="button secondary small"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((e) =>
                        e.id === exp.id ? { ...e, confirmed: true } : e,
                      ),
                    }));
                    notify(
                      "Confirmação do trabalhador registrada no exemplo. A declaração do empregador já estava disponível.",
                    );
                  }}
                >
                  Confirmar experiência de exemplo
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      cases: [
                        ...prev.cases,
                        {
                          id: crypto.randomUUID(),
                          title: "Experiência contestada · exemplo",
                          detail: exp.title,
                          status: "Aberto",
                        },
                      ],
                    }));
                    notify(
                      "Contestação fictícia encaminhada para a fila de atendimentos.",
                    );
                  }}
                >
                  Contestar registro
                </button>
              </div>
            )}
            {exp.confirmed && exp.ended && !exp.rating && (
              <div className="record-actions">
                <button
                  className="button secondary small"
                  onClick={() =>
                    setRatingFor(ratingFor === exp.id ? "" : exp.id)
                  }
                >
                  <Icon name="star" size={17} />
                  Avaliar experiência
                </button>
              </div>
            )}
            {exp.rating && (
              <div className="review-result">
                <span className="stars">
                  {"★".repeat(exp.rating)}
                  {"☆".repeat(5 - exp.rating)}
                </span>
                <p>{exp.review}</p>
                <small>
                  Avaliação restrita · enviada para análise simulada
                </small>
              </div>
            )}
            {ratingFor === exp.id && !exp.rating && (
              <form
                className="review-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  setState((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((item) =>
                      item.id === exp.id
                        ? {
                            ...item,
                            rating: Number(d.get("rating")),
                            review: String(d.get("text")),
                          }
                        : item,
                    ),
                  }));
                  setRatingFor("");
                  notify(
                    "Avaliação de exemplo registrada para análise. Ela não é publicada na busca.",
                  );
                }}
              >
                <Field label="Como foi a experiência?">
                  <select name="rating" defaultValue="5">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option value={n} key={n}>
                        {n} de 5
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Relato de exemplo">
                  <textarea
                    name="text"
                    required
                    maxLength={1000}
                    rows={3}
                    placeholder="Não inclua documentos ou dados pessoais."
                  />
                </Field>
                <button className="button primary small" type="submit">
                  Enviar avaliação de exemplo
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      <NoticeBox>
        O histórico não é uma certidão de vínculo. Experiências autodeclaradas e
        confirmações aparecem separadas. As regras reais de avaliação dependem
        da política do sindicato.
      </NoticeBox>
    </>
  );
}

function EmployersPage() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const employers = [...new Set(state.jobs.map((j) => j.employer))].filter(
    (n) => n.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Title
        eyebrow="ACOMPANHAMENTO RESPONSÁVEL"
        title="Empregadores"
        description="Cadastros e oportunidades de exemplo, sem exposição de documentos reais."
      />
      <Field label="Buscar empregador">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome de exibição"
        />
      </Field>
      <div className="record-list">
        {employers.map((name) => (
          <article className="record-card" key={name}>
            <div className="record-top">
              <div className="candidate-header">
                <Avatar name={name} />
                <div>
                  <h3>{name}</h3>
                  <p className="muted">
                    {name === state.employer.name &&
                    state.employer.type === "PJ"
                      ? "Pessoa jurídica"
                      : "Pessoa física"}{" "}
                    · consulta cadastral não realizada
                  </p>
                </div>
              </div>
              <Badge tone="gray">Cadastro fictício</Badge>
            </div>
            <p>
              {state.jobs.filter((j) => j.employer === name).length} vagas
              registradas nesta demonstração
            </p>
            <Link href="/sindicato/relatorios" className="inline-link">
              Consultar relatórios
              <Icon name="arrow" size={16} />
            </Link>
          </article>
        ))}
        {!employers.length && (
          <Empty
            title="Nenhum cadastro encontrado"
            description="Tente outro nome de exemplo."
          />
        )}
      </div>
    </>
  );
}

function CasesPage() {
  const { state, setState, notify } = useDemo();
  const [filter, setFilter] = useState("Aberto");
  const cases = state.cases.filter((c) => !filter || c.status === filter);
  const reviews = state.experiences.filter((e) => e.rating);
  return (
    <>
      <Title
        eyebrow="ESCUTA PARA CUIDAR"
        title="Atendimentos e avaliações"
        description="Acompanhe solicitações de apoio e relatos restritos de demonstração."
      />
      <Field label="Situação do atendimento">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todos os atendimentos</option>
          <option>Aberto</option>
          <option>Concluído</option>
        </select>
      </Field>
      <div className="record-list">
        {cases.map((c) => (
          <article className="record-card" key={c.id}>
            <div className="record-top">
              <h3>{c.title}</h3>
              <Badge tone={c.status === "Aberto" ? "amber" : "green"}>
                {c.status}
              </Badge>
            </div>
            <p>{c.detail}</p>
            {c.status === "Aberto" && (
              <button
                className="button secondary small"
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    cases: prev.cases.map((item) =>
                      item.id === c.id
                        ? { ...item, status: "Concluído" }
                        : item,
                    ),
                  }));
                  notify("Atendimento fictício marcado como concluído.");
                }}
              >
                Concluir atendimento de exemplo
              </button>
            )}
          </article>
        ))}
        {!cases.length && (
          <Empty
            title="Nenhum atendimento nesta situação"
            description="A fila de exemplo está em dia."
          />
        )}
      </div>
      {reviews.length > 0 && (
        <>
          <div className="panel-heading">
            <h2>Avaliações restritas</h2>
          </div>
          {reviews.map((r) => (
            <article className="record-card" key={r.id}>
              <h3>{r.employer}</h3>
              <span className="stars">{"★".repeat(r.rating!)}</span>
              <p>{r.review}</p>
              <Badge tone="amber">Análise simulada pendente</Badge>
            </article>
          ))}
        </>
      )}
    </>
  );
}

function ReportsPage() {
  const { state, notify } = useDemo();
  const [employer, setEmployer] = useState("");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");
  const [exported, setExported] = useState(false);
  const employers = [...new Set(state.jobs.map((j) => j.employer))];
  const jobs = state.jobs.filter(
    (j) =>
      (!employer || j.employer === employer) && j.date >= from && j.date <= to,
  );
  const applications = state.applications.filter(
    (a) => jobs.some((j) => j.id === a.jobId) && a.date >= from && a.date <= to,
  );
  const rows = employers
    .filter((name) => !employer || name === employer)
    .map((name) => {
      const own = jobs.filter((j) => j.employer === name);
      return {
        name,
        jobs: own.length,
        published: own.filter((j) => j.status === "Publicada").length,
        applications: applications.filter((a) =>
          own.some((j) => j.id === a.jobId),
        ).length,
      };
    });
  function exportCSV() {
    const safe = (value: string) =>
      '"' +
      (/^[=+\-@\t\r]/.test(value) ? "'" : "") +
      value.replace(/"/g, '""') +
      '"';
    const text =
      "\uFEFFEmpregador;Vagas;Publicadas atualmente;Candidaturas\n" +
      rows
        .map(
          (r) => `${safe(r.name)};${r.jobs};${r.published};${r.applications}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-demonstracao-sintedorp.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    notify("CSV de demonstração gerado, sem documentos ou contatos pessoais.");
  }
  return (
    <>
      <Title
        eyebrow="DADOS PARA ACOMPANHAR"
        title="Relatórios de empregadores"
        description="Indicadores calculados a partir dos dados fictícios desta sessão."
        action={
          <button
            className="button secondary small"
            onClick={exportCSV}
            disabled={from > to}
          >
            <Icon name="download" size={17} />
            Exportar CSV
          </button>
        }
      />
      <div className="report-filters">
        <Field label="Empregador">
          <select
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
          >
            <option value="">Todos os empregadores</option>
            {employers.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label="Início">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="Fim">
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>
      {from > to && (
        <p role="alert" className="error-text">
          A data final deve ser igual ou posterior à inicial.
        </p>
      )}
      <Stats
        items={[
          { label: "Vagas no período", value: jobs.length, icon: "bag" },
          {
            label: "Publicadas atualmente",
            value: jobs.filter((j) => j.status === "Publicada").length,
            icon: "shield",
          },
          {
            label: "Candidaturas de exemplo",
            value: applications.length,
            icon: "user",
          },
        ]}
      />
      <div className="table-wrap">
        <table>
          <caption>Resumo de demonstração por empregador</caption>
          <thead>
            <tr>
              <th scope="col">Empregador</th>
              <th scope="col">Vagas</th>
              <th scope="col">Publicadas</th>
              <th scope="col">Candidaturas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                <td>{r.jobs}</td>
                <td>{r.published}</td>
                <td>{r.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {exported && (
        <p role="status" className="small-note">
          Arquivo de demonstração gerado.
        </p>
      )}
      <NoticeBox>
        Este protótipo filtra as datas registradas de vagas e candidaturas e
        mostra a situação atual. O relatório funcional da Etapa 5 usará eventos
        separados de envio, aprovação, contratação e confirmação, com seus
        próprios períodos.
      </NoticeBox>
    </>
  );
}

function TeamPage() {
  const { state, setState, notify } = useDemo();
  return (
    <>
      <Title
        eyebrow="QUEM CUIDA DA PLATAFORMA"
        title="Equipe do sindicato"
        description="Demonstração de convites e papéis. Nenhuma conta privilegiada real é criada aqui."
      />
      <div className="record-list">
        {state.team.map((person) => (
          <article key={person.id} className="record-card">
            <div className="record-top">
              <div className="candidate-header">
                <Avatar name={person.name} />
                <div>
                  <h3>{person.name}</h3>
                  <p className="muted">{person.role}</p>
                </div>
              </div>
              <Badge tone={person.status === "Revogado" ? "gray" : "green"}>
                {person.status}
              </Badge>
            </div>
            {person.role !== "Administrador" &&
              person.status !== "Revogado" && (
                <button
                  className="text-button"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      team: prev.team.map((p) =>
                        p.id === person.id ? { ...p, status: "Revogado" } : p,
                      ),
                    }));
                    notify(
                      "Acesso de exemplo revogado. Nenhuma sessão real foi alterada.",
                    );
                  }}
                >
                  Revogar acesso de exemplo
                </button>
              )}
          </article>
        ))}
      </div>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setState((prev) => ({
            ...prev,
            team: [
              ...prev.team,
              {
                id: crypto.randomUUID(),
                name: String(d.get("name")),
                role: String(d.get("role")),
                status: "Convite simulado",
              },
            ],
          }));
          notify("Convite de demonstração criado. Nenhum e-mail foi enviado.");
          e.currentTarget.reset();
        }}
      >
        <h2>Simular convite</h2>
        <Field label="Nome de exemplo">
          <input name="name" required maxLength={80} />
        </Field>
        <Field label="Função na equipe">
          <select name="role">
            <option>Moderador</option>
            <option>Analista de relatórios</option>
          </select>
        </Field>
        <button className="button primary" type="submit">
          Criar convite de exemplo
          <Icon name="plus" size={18} />
        </button>
      </form>
    </>
  );
}
