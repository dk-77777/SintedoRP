"use client";

import Link from "@/demo/navigation";
import { useRouter } from "@/demo/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useDemo } from "@/demo/provider";
import { categories, regions, money, type Role } from "@/demo/data";
import { Icon } from "./icon";
import {
  ActionLink,
  Badge,
  Empty,
  Field,
  JobCard,
  NoticeBox,
  Title,
} from "./ui";

export function CommunityArt() {
  return (
    <div className="community-art" aria-hidden="true">
      <div className="art-grain" />
      <svg className="people-art" viewBox="0 0 520 470" fill="none">
        <path d="M83 416V223a174 174 0 0 1 348 0v193" fill="#E8C9AC" />
        <path
          d="M55 408c85-24 114 30 179 14 102-25 152-24 249-8"
          stroke="#C99F7E"
          strokeWidth="2"
        />
        <path
          d="M99 409c-12-70 5-149 60-158 55-10 83 43 83 143"
          fill="#B94C16"
        />
        <path
          d="M137 196c-6 17-1 49 14 61 19 16 48 4 53-17l7-55-74 11Z"
          fill="#A46548"
        />
        <path
          d="M128 202c-25-51 6-90 44-88 52 3 52 53 34 84-12-29-41-17-78 4Z"
          fill="#33261F"
        />
        <path d="M131 217c-11-17-17-31-9-35 8-4 17 4 17 4" fill="#A46548" />
        <path
          d="M153 214h6m28-4h6"
          stroke="#513C30"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M163 233c9 4 15 2 21-4"
          stroke="#683E2F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M147 268c-14 70-8 93 17 99l89-27"
          stroke="#A46548"
          strokeWidth="25"
          strokeLinecap="round"
        />
        <path
          d="M346 403c8-43 16-101-26-134-27-22-59-12-75 28l-21 106"
          fill="#F4EEE2"
        />
        <path
          d="M291 198c-5 18-2 48 11 58 18 15 45 5 52-16l8-49-71 7Z"
          fill="#D49B76"
        />
        <path
          d="M280 215c-24-63 7-111 41-104 47-4 61 54 35 111l-13-42c-27 17-46 9-50-3l-13 38Z"
          fill="#673F2C"
        />
        <path
          d="M304 213h6m24-2h6"
          stroke="#513C30"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M311 233c8 5 16 2 21-3"
          stroke="#895437"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M289 279c-10 45-15 49-45 55"
          stroke="#D49B76"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path d="M239 331c-9 0-15 4-15 9 0 7 18 13 28 9" fill="#A46548" />
        <path
          d="M391 391c17-59 4-102 31-139m-15 103c-36-9-49-33-40-49 22 4 36 23 40 49Zm10-51c31-6 44-22 38-39-24 5-35 17-38 39Z"
          stroke="#875F43"
          strokeWidth="3"
          fill="#C99872"
        />
        <path
          d="m102 100 7-19 8 19 20 8-20 7-8 19-7-19-19-7 19-8Z"
          fill="#B94C16"
        />
        <circle cx="404" cy="111" r="7" fill="#C2824F" />
        <path
          d="M376 91c-51-63-149-58-174-20"
          stroke="#A87552"
          strokeWidth="2"
          strokeDasharray="5 8"
        />
      </svg>
      <div className="art-caption">
        <span className="caption-mark">
          <Icon name="heart" size={23} />
        </span>
        <div>
          Trabalho com respeito.
          <br />
          <strong>Conexões com propósito.</strong>
        </div>
      </div>
      <div className="art-stamp">
        <Icon name="shield" size={26} />
        <span>
          Com mediação
          <br />
          do sindicato
        </span>
      </div>
      <div className="art-label">GENTE QUE CUIDA. GENTE QUE CONECTA.</div>
    </div>
  );
}

export function HomePage() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const router = useRouter();
  function search(e: FormEvent) {
    e.preventDefault();
    router.push(`/vagas?q=${encodeURIComponent(query)}`);
  }
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" />
              CONEXÕES QUE TRANSFORMAM
            </p>
            <h1>
              Quem cuida
              <br />
              também merece
              <br />
              <em>ser valorizado.</em>
            </h1>
            <p className="hero-description">
              Oportunidades para trabalhadores domésticos, com diálogo, respeito
              e a mediação do SINTEDORP.
            </p>
            <div className="hero-actions">
              <ActionLink href="/vagas">
                Encontrar trabalho <Icon name="arrow" />
              </ActionLink>
              <ActionLink href="/cadastro" secondary>
                Quero contratar
              </ActionLink>
            </div>
            <p className="hero-footnote">
              <Icon name="shield" size={16} />
              Acesso gratuito. Uma conexão mais humana.
            </p>
          </div>
          <CommunityArt />
        </div>
      </section>
      <div className="container">
        <form className="home-search" onSubmit={search}>
          <div className="search-intro">
            <span>Seu próximo passo</span>
            <strong>pode começar aqui.</strong>
          </div>
          <label className="search-input">
            <Icon name="search" />
            <span className="sr-only">Função ou palavra-chave</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qual trabalho você procura?"
            />
          </label>
          <span className="search-city">
            <Icon name="pin" size={18} />
            Ribeirão Preto e região
          </span>
          <button className="button primary" type="submit">
            Buscar vagas <Icon name="arrow" size={18} />
          </button>
        </form>
      </div>
      <section className="section opportunities">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">UM CAMINHO PARA RECOMEÇAR</p>
              <h2>Oportunidades que aproximam.</h2>
              <p className="muted">
                Explore vagas de exemplo e conheça a proposta da plataforma.
              </p>
            </div>
            <Link href="/vagas" className="inline-link">
              Ver todas as vagas <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="job-grid">
            {state.jobs
              .filter((j) => j.status === "Publicada")
              .slice(0, 3)
              .map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
          </div>
        </div>
      </section>
      <section className="how-section section">
        <div className="container">
          <div className="how-heading">
            <div>
              <p className="eyebrow">SIMPLES, DO COMEÇO AO FIM</p>
              <h2>
                Um encontro bom
                <br />
                começa com confiança.
              </h2>
            </div>
            <p>
              O sindicato acompanha o caminho.
              <br />
              Você dá o próximo passo no seu ritmo.
            </p>
          </div>
          <div className="steps-grid">
            <div>
              <span className="step-number">01</span>
              <h3>Conte sua história</h3>
              <p>
                Crie seu perfil e compartilhe suas experiências, funções e
                disponibilidade.
              </p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>Encontre uma oportunidade</h3>
              <p>
                Busque vagas por região e função, conheça as condições e envie
                sua candidatura.
              </p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Converse com apoio</h3>
              <p>
                Combine os próximos passos com o contratante e conte com a
                mediação sindical.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="container support-section">
        <div className="support-symbol">
          <Icon name="leaf" size={68} />
        </div>
        <div>
          <p className="eyebrow">NINGUÉM PRECISA CAMINHAR SOZINHO</p>
          <h2>O sindicato está por perto.</h2>
          <p>
            Orientação, escuta e apoio para construir relações de trabalho mais
            respeitosas.
          </p>
        </div>
        <ActionLink href="/contato" secondary>
          Conhecer o SINTEDORP <Icon name="arrow" size={18} />
        </ActionLink>
      </section>
    </>
  );
}

export function JobsPage() {
  const { state } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState("");
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") || "");
  }, []);
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [period, setPeriod] = useState("");
  const [salary, setSalary] = useState("");
  const [schedule, setSchedule] = useState("");
  const [page, setPage] = useState(1);
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const jobs = state.jobs.filter(
    (j) =>
      j.status === "Publicada" &&
      normalize(`${j.title} ${j.category} ${j.region}`).includes(
        normalize(query),
      ) &&
      (!category || j.category === category) &&
      (!region || j.region === region) &&
      (!period || j.period === period) &&
      (!salary || !period || j.salary >= Number(salary)) &&
      (!schedule || j.schedule === schedule),
  );
  const count = Math.ceil(jobs.length / 6);
  const current = Math.min(page, Math.max(count, 1));
  function reset() {
    setQuery("");
    setCategory("");
    setRegion("");
    setPeriod("");
    setSalary("");
    setSchedule("");
    setPage(1);
    router.replace("/vagas", { scroll: false });
  }
  return (
    <section className="container page-section">
      <Title
        eyebrow="SEU PRÓXIMO PASSO"
        title="Encontre seu lugar."
        description="Oportunidades com condições claras, para você escolher com tranquilidade."
      />
      <div className="listing-layout">
        <aside className="filter-panel">
          <div className="filter-title">
            <h2>Filtrar oportunidades</h2>
            <button className="text-button" onClick={reset}>
              Limpar
            </button>
          </div>
          <Field label="Buscar por palavra-chave">
            <input
              placeholder="Função ou palavra-chave"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Função">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as funções</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Região">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as regiões</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Jornada">
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            >
              <option value="">Todas as jornadas</option>
              <option>Segunda a sexta</option>
              <option>Duas diárias por semana</option>
            </select>
          </Field>
          <Field label="Periodicidade da remuneração">
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">Qualquer periodicidade</option>
              <option value="mês">Por mês</option>
              <option value="dia">Por dia</option>
            </select>
          </Field>
          <Field
            label="Remuneração mínima (R$)"
            hint={
              period
                ? `Comparando valores por ${period}.`
                : "Selecione uma periodicidade para comparar valores."
            }
          >
            <input
              type="number"
              min="0"
              value={salary}
              disabled={!period}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Ex.: 2000"
            />
          </Field>
          <p className="filter-note">
            <Icon name="shield" size={18} />
            Somente vagas com análise sindical simulada aparecem nesta busca.
          </p>
        </aside>
        <div>
          <div className="results-heading">
            <p aria-live="polite">
              <strong>{jobs.length}</strong>{" "}
              {jobs.length === 1
                ? "oportunidade de exemplo"
                : "oportunidades de exemplo"}
            </p>
            <span>Mais recentes primeiro</span>
          </div>
          {jobs.length ? (
            <>
              <div className="job-grid results-grid">
                {jobs.slice((current - 1) * 6, current * 6).map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
              {count > 1 && (
                <nav className="pagination" aria-label="Páginas de resultados">
                  <button
                    className="button secondary small"
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {current} de {count}
                  </span>
                  <button
                    className="button secondary small"
                    disabled={current === count}
                    onClick={() => setPage(current + 1)}
                  >
                    Próxima
                  </button>
                </nav>
              )}
            </>
          ) : (
            <Empty
              title="Ainda não encontramos essa combinação"
              description="Tente outra região, função ou faixa de remuneração."
            >
              <button className="button secondary" onClick={reset}>
                Limpar filtros
              </button>
            </Empty>
          )}
        </div>
      </div>
    </section>
  );
}

export function JobDetail({ id }: { id: string }) {
  const { state, setState, notify } = useDemo();
  const job = state.jobs.find((j) => j.id === id && j.status === "Publicada");
  if (!job)
    return (
      <section className="container page-section">
        <Empty
          title="Esta vaga não está disponível"
          description="Ela pode estar em análise ou já ter sido encerrada."
        >
          <ActionLink href="/vagas">Encontrar outras vagas</ActionLink>
        </Empty>
      </section>
    );
  const application = state.applications.find(
    (a) => a.jobId === id && a.workerId === "demo-worker",
  );
  function apply() {
    if (state.role !== "trabalhador" || application) return;
    setState((prev) => ({
      ...prev,
      applications: [
        ...prev.applications,
        {
          id: `cand-${crypto.randomUUID()}`,
          jobId: id,
          workerId: "demo-worker",
          worker: prev.profile.name,
          status: "Enviada",
          revision: job!.revision,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    notify("Candidatura de demonstração enviada. Acompanhe na sua área.");
  }
  return (
    <section className="container page-section">
      <Link className="back-link" href="/vagas">
        <Icon name="back" size={17} />
        Voltar para as oportunidades
      </Link>
      <div className="detail-layout">
        <article>
          <p className="eyebrow">{job.category.toUpperCase()}</p>
          <h1 className="detail-title">{job.title}</h1>
          <p className="muted">
            <Icon name="pin" size={17} /> {job.region}, Ribeirão Preto ·{" "}
            {job.employer}
          </p>
          <div className="detail-facts">
            <div>
              <Icon name="bag" />
              <span>
                Remuneração
                <strong>
                  {money(job.salary)} / {job.period}
                </strong>
              </span>
            </div>
            <div>
              <Icon name="clock" />
              <span>
                Jornada<strong>{job.schedule}</strong>
              </span>
            </div>
          </div>
          <section className="detail-block">
            <h2>Sobre a oportunidade</h2>
            <p>{job.description}</p>
          </section>
          <section className="detail-block">
            <h2>Horários e condições</h2>
            <p>{job.hours}</p>
            <p>{job.benefits}</p>
          </section>
          <NoticeBox>
            <strong>Condições registradas para análise</strong>
            <p>
              O contratante aceita as regras do sindicato antes da publicação.
              Esta é uma vaga fictícia, com análise simulada; os valores não
              representam orientação sobre piso salarial.
            </p>
          </NoticeBox>
        </article>
        <aside className="apply-card">
          <span className="category-icon">
            <Icon name="leaf" size={28} />
          </span>
          <h2>Gostou da oportunidade?</h2>
          <p>Envie sua candidatura e comece uma conversa com o contratante.</p>
          {state.role === "trabalhador" ? (
            <button
              className="button primary full"
              onClick={apply}
              disabled={!!application}
            >
              {application ? "Candidatura já enviada" : "Quero me candidatar"}
              <Icon name="arrow" size={18} />
            </button>
          ) : (
            <ActionLink href="/entrar">
              Entrar como trabalhador <Icon name="arrow" size={18} />
            </ActionLink>
          )}
          {application && (
            <Link href="/trabalhador/candidaturas" className="inline-link">
              Acompanhar candidatura
            </Link>
          )}
          <p className="small-note">
            <Icon name="shield" size={15} />
            Seu documento não é publicado.
          </p>
          <span className="detail-version">Versão da vaga: {job.revision}</span>
        </aside>
      </div>
    </section>
  );
}

export function AccessPage() {
  const { setState, notify } = useDemo();
  const router = useRouter();
  function enter(role: Role) {
    setState((prev) => ({ ...prev, role }));
    notify(`Perfil de ${role} selecionado para demonstração.`);
    router.push(`/${role}`);
  }
  return (
    <section className="container page-section access-page">
      <Title
        eyebrow="VAMOS NOS CONECTAR"
        title="Cada pessoa tem seu caminho."
        description="Escolha um perfil para conhecer os fluxos do protótipo."
      />
      <NoticeBox>
        <strong>Acesso de demonstração</strong>
        <p>
          Não há login real nesta etapa. Não informe senhas ou dados pessoais. O
          acesso da equipe sindical será restrito na versão funcional.
        </p>
      </NoticeBox>
      <div className="profile-choices">
        {(
          [
            {
              role: "trabalhador",
              icon: "user",
              title: "Quero encontrar trabalho",
              text: "Conte sua história, explore oportunidades e acompanhe suas candidaturas.",
            },
            {
              role: "empregador",
              icon: "home",
              title: "Quero contratar",
              text: "Pessoa física ou empresa: publique vagas e converse com candidatos.",
            },
            {
              role: "sindicato",
              icon: "shield",
              title: "Sou da equipe do sindicato",
              text: "Conheça a análise de vagas, os atendimentos e os relatórios.",
            },
          ] as const
        ).map((p) => (
          <article className="profile-choice" key={p.role}>
            <span className="category-icon">
              <Icon name={p.icon} size={28} />
            </span>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <button className="button primary" onClick={() => enter(p.role)}>
              Demonstrar {p.role}
              <Icon name="arrow" size={17} />
            </button>
          </article>
        ))}
      </div>
      <p className="access-help">
        Quer conhecer o cadastro?{" "}
        <Link href="/cadastro">Preencher com dados de exemplo</Link> ·{" "}
        <Link href="/recuperar-acesso">Recuperação de acesso</Link>
      </p>
    </section>
  );
}

export function RegistrationPage() {
  const { setState, notify } = useDemo();
  const [role, setRole] = useState<"trabalhador" | "empregador">("trabalhador");
  const [type, setType] = useState<"PF" | "PJ">("PF");
  const [reviewing, setReviewing] = useState(false);
  const [name, setName] = useState("Pessoa de demonstração");
  const router = useRouter();
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!reviewing) {
      setReviewing(true);
      return;
    }
    setState((prev) => ({
      ...prev,
      role,
      profile:
        role === "trabalhador"
          ? { ...prev.profile, name: `${name} · exemplo` }
          : prev.profile,
      employer:
        role === "empregador"
          ? { ...prev.employer, name: `${name} · exemplo`, type }
          : prev.employer,
    }));
    notify("Cadastro fictício concluído. Explore sua área de demonstração.");
    router.push(`/${role}`);
  }
  return (
    <section className="container page-section narrow-page">
      <Title
        eyebrow="UM NOVO PASSO"
        title="Vamos começar por você."
        description="Formulário demonstrativo. Use apenas dados inventados."
      />
      <form className="form-card" onSubmit={submit}>
        {reviewing ? (
          <>
            <h2>Confira seu cadastro de exemplo</h2>
            <dl className="summary-list">
              <dt>Nome</dt>
              <dd>{name}</dd>
              <dt>Perfil</dt>
              <dd>{role}</dd>
              {role === "empregador" && (
                <>
                  <dt>Tipo</dt>
                  <dd>{type === "PF" ? "Pessoa física" : "Pessoa jurídica"}</dd>
                </>
              )}
            </dl>
            <NoticeBox>
              Documento de exemplo: consulta cadastral não realizada.
            </NoticeBox>
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setReviewing(false)}
              >
                Voltar e editar
              </button>
              <button className="button primary" type="submit">
                Concluir cadastro fictício
                <Icon name="check" size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <fieldset className="choice-field">
              <legend>Como você quer participar?</legend>
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={role === "trabalhador"}
                  onChange={() => setRole("trabalhador")}
                />
                Encontrar trabalho
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={role === "empregador"}
                  onChange={() => setRole("empregador")}
                />
                Contratar
              </label>
            </fieldset>
            {role === "empregador" && (
              <Field label="Tipo de empregador">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "PF" | "PJ")}
                >
                  <option value="PF">Pessoa física — CPF</option>
                  <option value="PJ">Pessoa jurídica — CNPJ</option>
                </select>
              </Field>
            )}
            <Field
              label={
                role === "empregador" && type === "PJ"
                  ? "Nome da organização de exemplo"
                  : "Nome de exemplo"
              }
            >
              <input
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field
              label="E-mail de exemplo"
              hint="Campo fixo para não coletar dados reais nesta etapa."
            >
              <input type="email" value="demonstracao@example.test" readOnly />
            </Field>
            <Field
              label={
                role === "empregador" && type === "PJ"
                  ? "CNPJ de demonstração"
                  : "CPF de demonstração"
              }
              hint="Identificador fictício; não realiza consulta nem comprova identidade."
            >
              <input
                value={
                  type === "PJ" && role === "empregador"
                    ? "CNPJ-DEMO"
                    : "CPF-DEMO"
                }
                readOnly
              />
            </Field>
            <label className="checkbox-label">
              <input type="checkbox" required />
              Entendo que este cadastro é fictício e serve apenas para
              demonstrar a navegação.
            </label>
            <button className="button primary full" type="submit">
              Revisar cadastro
              <Icon name="arrow" size={18} />
            </button>
          </>
        )}
      </form>
    </section>
  );
}

export function RecoveryPage() {
  const [sent, setSent] = useState(false);
  return (
    <section className="container page-section narrow-page">
      <Title
        eyebrow="ACESSO À SUA CONTA"
        title="Um caminho para voltar."
        description="Conheça a proposta de recuperação de acesso."
      />
      <div className="form-card">
        {sent ? (
          <div role="status">
            <Badge tone="green">Solicitação simulada</Badge>
            <h2>Confira seu e-mail na versão funcional</h2>
            <p>
              Nenhum e-mail foi enviado neste protótipo. O sistema real
              utilizará um link temporário de uso único, sem revelar se a conta
              existe.
            </p>
            <ActionLink href="/entrar">Voltar ao acesso</ActionLink>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <Field label="E-mail de exemplo">
              <input type="email" value="demonstracao@example.test" readOnly />
            </Field>
            <button className="button primary full" type="submit">
              Simular recuperação
              <Icon name="arrow" size={18} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export function InfoPage({ path }: { path: string }) {
  const { notify, setState } = useDemo();
  if (path === "/como-funciona")
    return (
      <section className="container page-section info-page">
        <Title
          eyebrow="DIÁLOGO EM CADA ETAPA"
          title="Uma ponte, com gente por perto."
          description="O Conecta aproxima trabalhadores e contratantes com acompanhamento sindical."
        />
        <div className="info-grid">
          <article className="form-card">
            <h2>Para quem busca trabalho</h2>
            <ol className="numbered-list">
              <li>Crie seu perfil profissional.</li>
              <li>Busque vagas com condições registradas.</li>
              <li>Envie sua candidatura e acompanhe o retorno.</li>
              <li>Converse pelo canal autorizado e registre o resultado.</li>
            </ol>
            <ActionLink href="/entrar">Explorar como trabalhador</ActionLink>
          </article>
          <article className="form-card">
            <h2>Para quem contrata</h2>
            <ol className="numbered-list">
              <li>Cadastre-se como pessoa física ou jurídica.</li>
              <li>Informe função, jornada, remuneração e benefícios.</li>
              <li>Aceite as regras e aguarde a análise sindical.</li>
              <li>Acompanhe candidatos e combine os próximos passos.</li>
            </ol>
            <ActionLink href="/entrar" secondary>
              Explorar como empregador
            </ActionLink>
          </article>
        </div>
        <NoticeBox>
          A análise das condições não é garantia de contratação nem comprovação
          de cumprimento legal. Regras oficiais, fontes e vigências serão
          validadas com o sindicato.
        </NoticeBox>
      </section>
    );
  if (path === "/privacidade")
    return (
      <section className="container page-section narrow-page">
        <Title
          eyebrow="CUIDADO TAMBÉM COM OS DADOS"
          title="Privacidade começa com clareza."
          description="Orientações do protótipo; a política oficial será validada antes do uso real."
        />
        <div className="form-card prose">
          <h2>Nesta demonstração</h2>
          <p>
            Use apenas informações fictícias. Alterações permanecem na memória
            ou no armazenamento da sessão deste navegador. Não há banco de
            dados, consulta cadastral nem envio de e-mail.
          </p>
          <h2>Na versão funcional</h2>
          <p>
            Documentos, contatos pessoais, mensagens e histórico individual
            terão acesso limitado às pessoas autorizadas. O cadastro não será
            uma lista pública de trabalhadores.
          </p>
          <h2>Antes da publicação</h2>
          <p>
            O responsável pelo tratamento, as finalidades, bases legais,
            retenção e canal para direitos dos titulares deverão ser definidos
            com o sindicato. Este texto não é a política institucional final.
          </p>
          <ActionLink href="/contato" secondary>
            Conhecer o canal de atendimento
          </ActionLink>
        </div>
      </section>
    );
  return (
    <section className="container page-section info-page">
      <Title
        eyebrow="ESCUTA QUE APROXIMA"
        title="Conte com o sindicato."
        description="O SINTEDORP representa trabalhadores domésticos de Ribeirão Preto."
      />
      <div className="info-grid">
        <article className="form-card prose">
          <span className="category-icon">
            <Icon name="shield" size={28} />
          </span>
          <h2>Orientação e mediação</h2>
          <p>
            O projeto propõe um espaço para esclarecer condições das vagas,
            acompanhar encaminhamentos e atender situações que precisam de
            diálogo.
          </p>
          <p className="muted">
            Contatos e horários oficiais serão confirmados com o sindicato antes
            da publicação. Não há atendimento externo ativo nesta demonstração.
          </p>
          <ActionLink href="/como-funciona" secondary>
            Entender a plataforma
          </ActionLink>
        </article>
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setState((prev) => ({
              ...prev,
              cases: [
                ...prev.cases,
                {
                  id: crypto.randomUUID(),
                  title: String(form.get("subject")),
                  detail: String(form.get("text")),
                  status: "Aberto",
                },
              ],
            }));
            notify(
              "Atendimento fictício registrado na demonstração. Nenhuma mensagem foi enviada ao sindicato.",
            );
            e.currentTarget.reset();
          }}
        >
          <h2>Simular um atendimento</h2>
          <Field label="Assunto de exemplo">
            <input
              name="subject"
              required
              maxLength={100}
              placeholder="Ex.: dúvida sobre uma vaga"
            />
          </Field>
          <Field label="Mensagem de exemplo">
            <textarea
              name="text"
              required
              maxLength={1000}
              rows={4}
              placeholder="Escreva somente informações inventadas."
            />
          </Field>
          <button className="button primary" type="submit">
            Registrar exemplo
            <Icon name="arrow" size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
