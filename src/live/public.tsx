"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import {
  ActionLink,
  Badge,
  Empty,
  Field,
  NoticeBox,
  Title,
} from "@/components/ui";
import { useLive } from "./provider";
import { authClient } from "./auth-client";
import { JobCard, money, MutationForm, value } from "./ui";
export const categories = [
  "Doméstica",
  "Diarista",
  "Babá",
  "Cuidador de idosos",
  "Cozinheiro",
  "Jardineiro",
  "Outro",
];

function AccompanimentSteps() {
  return (
    <ol className="connection-steps">
      <li>
        <span className="step-number">01</span>
        <div>
          <h3>Vagas claras</h3>
          <p>Função, jornada e remuneração.</p>
        </div>
      </li>
      <li>
        <span className="step-number">02</span>
        <div>
          <h3>Diálogo</h3>
          <p>Conversa após a candidatura.</p>
        </div>
      </li>
      <li>
        <span className="step-number">03</span>
        <div>
          <h3>Histórico</h3>
          <p>Períodos confirmados pelas partes.</p>
        </div>
      </li>
    </ol>
  );
}
export function Home() {
  const { state } = useLive();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const jobs =
    state?.jobs.filter((j) => j.status === "Publicada").slice(0, 3) ?? [];
  return (
    <>
      <section className="hero home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" /> TRABALHO DOMÉSTICO · RIBEIRÃO PRETO
              E REGIÃO
            </p>
            <h1 tabIndex={-1}>
              Boas conexões.
              <br />
              <em>Trabalho com respeito.</em>
            </h1>
            <p className="hero-description">
              Oportunidades com condições claras e acompanhamento do SINTEDORP.
            </p>
            <form
              className="hero-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/vagas?q=${encodeURIComponent(query)}`);
              }}
            >
              <label htmlFor="home-query">Qual trabalho você procura?</label>
              <div>
                <span className="hero-search-field">
                  <Icon name="search" />
                  <input
                    id="home-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Função ou palavra-chave"
                  />
                </span>
                <button className="button primary">
                  Buscar vagas <Icon name="arrow" size={18} />
                </button>
              </div>
            </form>
            <p className="hero-employer">
              Quer contratar?{" "}
              <Link href="/cadastro">
                Cadastre uma oportunidade <Icon name="arrow" size={16} />
              </Link>
            </p>
          </div>
          <div className="accompaniment-board">
            <div className="board-heading">
              <span className="board-symbol">
                <Icon name="shield" size={27} />
              </span>
              <span className="eyebrow">APOIO DO SINTEDORP</span>
            </div>
            <h2>Clareza em cada passo.</h2>
            <div className="board-desktop-steps">
              <AccompanimentSteps />
            </div>
            <details className="board-mobile-details">
              <summary>Como funciona o acompanhamento</summary>
              <AccompanimentSteps />
            </details>
            <div className="board-footer">
              <Icon name="pin" size={18} />
              <span>Ribeirão Preto e região</span>
            </div>
          </div>
        </div>
      </section>
      <section className="container page-section opportunities-section">
        <div className="page-title">
          <div>
            <h2>Oportunidades</h2>
            <p className="muted">Vagas analisadas pelo sindicato.</p>
          </div>
          <ActionLink href="/vagas" secondary>
            Ver todas as vagas <Icon name="arrow" size={18} />
          </ActionLink>
        </div>
        {jobs.length ? (
          <div className="job-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Empty
            title="Novas vagas em breve"
            description="As oportunidades são publicadas após análise sindical."
          />
        )}
      </section>
      <section className="home-how" aria-labelledby="home-how-title">
        <div className="container">
          <div className="page-title">
            <div>
              <h2 id="home-how-title">Como podemos ajudar?</h2>
            </div>
            <Link href="/como-funciona" className="inline-link">
              Como funciona <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="path-grid">
            <article className="path-card">
              <span className="path-icon">
                <Icon name="bag" size={26} />
              </span>
              <h3>Encontrar trabalho</h3>
              <p>Busque vagas e acompanhe candidaturas.</p>
              <Link href="/cadastro">
                Criar meu perfil <Icon name="arrow" size={18} />
              </Link>
            </article>
            <article className="path-card">
              <span className="path-icon">
                <Icon name="home" size={26} />
              </span>
              <h3>Encontrar quem cuida</h3>
              <p>Publique vagas e converse com candidatos.</p>
              <Link href="/cadastro">
                Quero contratar <Icon name="arrow" size={18} />
              </Link>
            </article>
            <article className="path-card union-path">
              <span className="path-icon">
                <Icon name="heart" size={26} />
              </span>
              <h3>Contar com orientação</h3>
              <p>Orientação e apoio do SINTEDORP.</p>
              <Link href="/contato">
                Fale com o sindicato <Icon name="arrow" size={18} />
              </Link>
            </article>
          </div>
          <p className="home-scope">
            A plataforma aproxima pessoas; não garante contratação nem substitui
            obrigações trabalhistas.
          </p>
        </div>
      </section>
    </>
  );
}
export function Jobs() {
  const { state } = useLive();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = params.get("q") ?? "";
  const category = params.get("funcao") ?? "";
  const region = params.get("regiao") ?? "";
  const period = params.get("periodo") ?? "";
  const schedule = params.get("jornada") ?? "";
  const min = params.get("minimo") ?? "";
  const page = Math.max(1, Number(params.get("pagina")) || 1);
  const update = (name: string, next: string) => {
    const search = new URLSearchParams(window.location.search);
    if (next) search.set(name, next);
    else search.delete(name);
    if (name !== "pagina") search.delete("pagina");
    const suffix = search.toString();
    window.history.replaceState(
      null,
      "",
      `/vagas${suffix ? "?" + suffix : ""}`,
    );
  };
  const clear = () => window.history.replaceState(null, "", "/vagas");
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && filtersOpen) {
        setFiltersOpen(false);
        document.getElementById("filters-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [filtersOpen]);
  const all = state?.jobs.filter((j) => j.status === "Publicada") ?? [];
  const matches = all.filter(
    (j) =>
      (!query ||
        `${j.title} ${j.description} ${j.employer_name}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"))) &&
      (!category || j.category === category) &&
      (!region || j.region === region) &&
      (!period || j.period === period) &&
      (!schedule ||
        j.schedule.toLowerCase().includes(schedule.toLowerCase())) &&
      (!min || j.salary_cents >= Math.round(Number(min) * 100)),
  );
  const current = Math.min(page, Math.max(1, Math.ceil(matches.length / 9)));
  const activeFilters = [
    ["q", query],
    ["funcao", category],
    ["regiao", region],
    ["periodo", period],
    ["jornada", schedule],
    ["minimo", min ? `A partir de R$ ${min}` : ""],
  ].filter(([, v]) => v);
  return (
    <section className="container page-section jobs-page">
      <Title
        title="Encontre uma vaga."
        description="Filtre por função, região e remuneração."
      />
      <div className="search-toolbar">
        <label className="main-search">
          <Icon name="search" />
          <span className="sr-only">Palavra-chave</span>
          <input
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Procure uma função ou palavra-chave"
          />
        </label>
        <button
          id="filters-toggle"
          className="button secondary filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="job-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Icon name="filter" size={18} />{" "}
          {filtersOpen ? "Fechar filtros" : "Filtros"}
          {activeFilters.length ? ` (${activeFilters.length})` : ""}
        </button>
      </div>
      {activeFilters.length > 0 && (
        <div className="active-filters" aria-label="Filtros aplicados">
          {activeFilters.map(([name, text]) => (
            <button
              key={name}
              onClick={() => update(name, "")}
              aria-label={`Remover filtro: ${text}`}
            >
              {text}
              <Icon name="close" size={14} />
            </button>
          ))}
          <button className="clear-filters" onClick={clear}>
            Limpar todos
          </button>
        </div>
      )}
      <div className="jobs-layout">
        <aside
          id="job-filters"
          className={`filter-panel ${filtersOpen ? "is-open" : ""}`}
          aria-label="Filtros de vagas"
        >
          <div className="filter-title">
            <h2>Refine sua busca</h2>
            <Icon name="filter" size={18} />
          </div>
          <Field label="Função">
            <select
              value={category}
              onChange={(e) => update("funcao", e.target.value)}
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
              onChange={(e) => update("regiao", e.target.value)}
            >
              <option value="">Todas as regiões</option>
              {[...new Set(all.map((j) => j.region))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Pagamento por">
            <select
              value={period}
              onChange={(e) => update("periodo", e.target.value)}
            >
              <option value="">Todos os períodos</option>
              {["Mês", "Dia", "Hora"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Jornada">
            <input
              value={schedule}
              onChange={(e) => update("jornada", e.target.value)}
              placeholder="Ex.: segunda a sexta"
            />
          </Field>
          <Field
            label="Valor mínimo (R$)"
            hint="Compare valores usando o mesmo período de pagamento."
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={min}
              onChange={(e) => update("minimo", e.target.value)}
            />
          </Field>
          <button className="text-button" onClick={clear}>
            Limpar filtros
          </button>
          <button
            className="button primary filters-apply"
            onClick={() => {
              setFiltersOpen(false);
              document.getElementById("filters-toggle")?.focus();
            }}
          >
            Ver {matches.length} resultado(s)
          </button>
        </aside>
        <div className="search-results">
          <div className="results-heading">
            <p role="status">
              <strong>{matches.length}</strong> vaga(s)
            </p>
            <span>Ribeirão Preto e região</span>
          </div>
          {matches.length ? (
            <div className="job-grid search-grid">
              {matches.slice((current - 1) * 9, current * 9).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Empty
              title="Nenhuma vaga encontrada"
              description="Ajuste os filtros e tente novamente."
            >
              <button className="button secondary" onClick={clear}>
                Limpar a busca
              </button>
            </Empty>
          )}
          {matches.length > 9 && (
            <nav className="pagination" aria-label="Páginas de vagas">
              <button
                disabled={current === 1}
                onClick={() => update("pagina", String(current - 1))}
              >
                Anterior
              </button>
              <span>
                Página {current} de {Math.ceil(matches.length / 9)}
              </span>
              <button
                disabled={current * 9 >= matches.length}
                onClick={() => update("pagina", String(current + 1))}
              >
                Próxima
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
export function JobDetail({ id }: { id: string }) {
  const { state, act, busy } = useLive();
  const job = state?.jobs.find((j) => j.id === id && j.status === "Publicada");
  if (!job)
    return (
      <section className="container page-section">
        <Title title="Vaga indisponível" />
        <Empty
          title="Esta vaga não está publicada"
          description="Ela pode estar em análise, encerrada ou ter recebido uma nova revisão."
        >
          <ActionLink href="/vagas">Buscar outras vagas</ActionLink>
        </Empty>
      </section>
    );
  const application = state?.applications.find(
    (a) => a.job_id === id && a.worker_id === state.user?.id,
  );
  const reviews =
    state?.reviews.filter(
      (r) => r.employer_id === job.employer_id && r.status === "Publicada",
    ) ?? [];
  return (
    <section className="container page-section">
      <Link href="/vagas" className="text-link">
        ← Todas as vagas
      </Link>
      <Title
        eyebrow={job.category.toUpperCase()}
        title={job.title}
        description={`${job.employer_name} · ${job.region}`}
      />
      <div className="detail-layout">
        <article className="form-card prose">
          <Badge tone="green">Condições analisadas pelo sindicato</Badge>
          <h2>Descrição</h2>
          <p className="preserve-lines">{job.description}</p>
          <h2>Jornada</h2>
          <p>
            {job.schedule} · {job.hours}
          </p>
          <h2>Benefícios</h2>
          <p>{job.benefits || "Nenhum benefício adicional informado."}</p>
          <h2>Empregador</h2>
          <p>
            {job.employer_type === "PF" ? "Pessoa física" : "Pessoa jurídica"} ·{" "}
            {job.employer_verified
              ? "Cadastro verificado manualmente"
              : "Cadastro com análise documental pendente"}
          </p>
          <NoticeBox>
            Análise sindical não confirma identidade, situação cadastral nem
            cumprimento das obrigações trabalhistas.
          </NoticeBox>
        </article>
        <aside className="form-card">
          <p className="eyebrow">REMUNERAÇÃO INFORMADA</p>
          <h2>
            {money(job.salary_cents)}{" "}
            <small>/ {job.period.toLowerCase()}</small>
          </h2>
          <p>Revisão {job.number}</p>
          {application ? (
            <>
              <Badge>{application.status}</Badge>
              <ActionLink href="/trabalhador/candidaturas">
                Acompanhar candidatura
              </ActionLink>
            </>
          ) : state?.user?.roles.includes("trabalhador") ? (
            <button
              className="button primary full"
              disabled={busy}
              onClick={() =>
                void act({ action: "apply", id: job.id, version: job.version })
              }
            >
              Enviar candidatura
            </button>
          ) : (
            <ActionLink href={state?.user ? "/cadastro/perfil" : "/entrar"}>
              Entrar para se candidatar
            </ActionLink>
          )}
          <p className="muted">
            Ao se candidatar, seu nome e perfil profissional serão apresentados
            ao empregador. Documento e e-mail não serão compartilhados.
          </p>
        </aside>
      </div>
      <div className="detail-reviews">
        <h2>Avaliações moderadas do empregador</h2>
        {reviews.length ? (
          reviews.map((r) => (
            <article className="form-card" key={r.id}>
              <strong>{r.rating}/5 · Experiência confirmada</strong>
              <p className="preserve-lines">{r.text}</p>
              {r.response && (
                <>
                  <h3>Resposta do empregador</h3>
                  <p className="preserve-lines">{r.response}</p>
                </>
              )}
            </article>
          ))
        ) : (
          <p className="muted">Ainda não há avaliações publicadas.</p>
        )}
      </div>
    </section>
  );
}
export function Access({
  mode,
}: {
  mode: "login" | "signup" | "recover" | "reset";
}) {
  const { notify, refresh } = useLive();
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessError, setAccessError] = useState("");
  const titles = {
    login: "Entrar",
    signup: "Criar conta",
    recover: "Recuperar acesso",
    reset: "Nova senha",
  };
  return (
    <section className="container page-section access-page">
      <div className="access-intro">
        <Title title={titles[mode]} />
      </div>
      <div className="form-card">
        {params.get("confirmado") && (
          <p role="status">E-mail confirmado. Entre com sua senha.</p>
        )}
        {params.get("error") && (
          <p role="alert">Link inválido ou expirado. Solicite outro.</p>
        )}
        {sent ? (
          <div className="access-success" role="status">
            <Icon name="check" size={28} />
            <p>
              {mode === "signup"
                ? "Enviamos um e-mail de confirmação."
                : mode === "reset"
                  ? "Senha redefinida. Suas sessões anteriores foram encerradas."
                  : "Se a conta existir, enviaremos um link de recuperação."}
            </p>
            <ActionLink href="/entrar">Voltar para entrar</ActionLink>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setAccessError("");
              const form = new FormData(e.currentTarget);
              try {
                const email = value(form, "email"),
                  password = String(form.get("password") ?? "");
                if (mode === "signup") {
                  const result = await authClient.signUp.email({
                    name: value(form, "name"),
                    email,
                    password,
                    callbackURL: `${window.location.origin}/entrar?confirmado=1`,
                  });
                  if (result.error) throw new Error(result.error.message);
                  setSent(true);
                }
                if (mode === "login") {
                  const result = await authClient.signIn.email({
                    email,
                    password,
                  });
                  if (result.error)
                    throw new Error(
                      "Confira seu e-mail, senha e confirmação da conta.",
                    );
                  const state = await refresh();
                  router.push(
                    state?.user?.roles.length ? "/painel" : "/cadastro/perfil",
                  );
                }
                if (mode === "recover") {
                  const result = await authClient.requestPasswordReset({
                    email,
                    redirectTo: `${window.location.origin}/redefinir-senha`,
                  });
                  if (result.error)
                    throw new Error(
                      "Não foi possível recuperar agora. Tente novamente.",
                    );
                  setSent(true);
                }
                if (mode === "reset") {
                  const token = params.get("token");
                  if (!token) throw new Error("Link inválido. Solicite outro.");
                  const result = await authClient.resetPassword({
                    token,
                    newPassword: password,
                  });
                  if (result.error)
                    throw new Error(
                      "Link expirado ou já utilizado. Solicite outro.",
                    );
                  setSent(true);
                }
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Falha na conexão.";
                setAccessError(message);
                notify(message, "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy}>
              {mode === "signup" && (
                <Field label="Nome completo">
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                  />
                </Field>
              )}
              {mode !== "reset" && (
                <Field label="E-mail">
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </Field>
              )}
              {mode !== "recover" && (
                <div className="password-field">
                  <Field
                    label={mode === "reset" ? "Nova senha" : "Senha"}
                    hint={
                      mode === "signup" || mode === "reset"
                        ? "Use pelo menos 12 caracteres."
                        : undefined
                    }
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      required
                      minLength={12}
                      maxLength={128}
                    />
                  </Field>
                  <button
                    className="password-toggle"
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              )}
              {mode === "signup" && (
                <label className="checkbox-field">
                  <input type="checkbox" required />
                  Li as orientações de{" "}
                  <Link href="/privacidade">privacidade</Link> e entendo a
                  finalidade deste ambiente.
                </label>
              )}
              <button className="button primary full" type="submit">
                {busy
                  ? "Aguarde…"
                  : mode === "login"
                    ? "Entrar"
                    : mode === "signup"
                      ? "Criar conta"
                      : mode === "reset"
                        ? "Redefinir senha"
                        : "Enviar link de recuperação"}
                <Icon name="arrow" size={18} />
              </button>
            </fieldset>
            {accessError && (
              <p className="form-error" role="alert">
                {accessError}
              </p>
            )}
          </form>
        )}
        {mode === "login" && (
          <>
            <p>
              <Link href="/recuperar-acesso">Esqueci minha senha</Link>
            </p>
            <p>
              Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link>
            </p>
            <details className="access-resend">
              <summary>Reenviar confirmação de e-mail</summary>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = value(new FormData(e.currentTarget), "email");
                  const result = await authClient.sendVerificationEmail({
                    email,
                    callbackURL: `${window.location.origin}/entrar?confirmado=1`,
                  });
                  notify(
                    result.error
                      ? "Tente novamente mais tarde."
                      : "Se a conta precisar de confirmação, o e-mail será enviado.",
                    result.error ? "error" : "info",
                  );
                }}
              >
                <Field label="E-mail">
                  <input type="email" name="email" required />
                </Field>
                <button className="text-button">Reenviar confirmação</button>
              </form>
            </details>
          </>
        )}
      </div>
    </section>
  );
}
export function Profile() {
  const { state } = useLive();
  const router = useRouter();
  const [kind, setKind] = useState("trabalhador");
  if (!state?.user)
    return (
      <section className="container page-section">
        <Title title="Entre para criar seu perfil" />
        <ActionLink href="/entrar">Entrar</ActionLink>
      </section>
    );
  return (
    <section className="container page-section narrow-page">
      <Title
        title="Escolha seu perfil"
        description="Informe apenas os dados necessários."
      />
      <NoticeBox>
        A conferência dos dígitos de CPF/CNPJ não é consulta à Receita Federal
        nem verificação de identidade.
      </NoticeBox>
      <MutationForm
        build={(form) => ({
          action: "profile",
          kind,
          document: value(form, "document"),
          name: value(form, "name"),
          region: value(form, "region"),
          category: value(form, "category") || "Outro",
          availability: value(form, "availability") || "A combinar",
          bio: value(form, "bio"),
          acceptedTerms: form.get("terms") === "on",
        })}
        onSuccess={() => router.push("/painel")}
      >
        <Field label="Tipo de perfil">
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="trabalhador">Trabalhador</option>
            <option value="PF">Empregador — pessoa física</option>
            <option value="PJ">Empregador — pessoa jurídica</option>
          </select>
        </Field>
        <Field label={kind === "PJ" ? "Nome da empresa" : "Nome completo"}>
          <input
            name="name"
            defaultValue={state.user.name}
            required
            maxLength={100}
          />
        </Field>
        <Field
          label={kind === "PJ" ? "CNPJ" : "CPF"}
          hint="Documento protegido e restrito ao cadastro."
        >
          <input
            name="document"
            required
            maxLength={30}
            autoComplete="off"
            inputMode={kind === "PJ" ? "text" : "numeric"}
          />
        </Field>
        <Field
          label="Cidade e região"
          hint="Não informe endereço residencial completo."
        >
          <input
            name="region"
            required
            maxLength={100}
            placeholder="Ex.: Ribeirão Preto — Centro"
          />
        </Field>
        {kind === "trabalhador" && (
          <>
            <Field label="Área profissional">
              <select name="category">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Disponibilidade">
              <input name="availability" required maxLength={160} />
            </Field>
            <Field
              label="Apresentação profissional"
              hint="Evite incluir documentos, endereço ou contato pessoal."
            >
              <textarea name="bio" maxLength={1500} rows={4} />
            </Field>
          </>
        )}
        <label className="checkbox-field">
          <input name="terms" type="checkbox" required />
          Li as orientações de privacidade e confirmo os dados deste perfil.
        </label>
        <button className="button primary">
          Salvar perfil <Icon name="arrow" size={18} />
        </button>
      </MutationForm>
    </section>
  );
}
export function Info({ path }: { path: string }) {
  return (
    <section className="container page-section narrow-page">
      <Title
        title={
          path === "/privacidade"
            ? "Privacidade"
            : path === "/contato"
              ? "Fale com o sindicato"
              : "Como funciona"
        }
      />
      <div className="form-card prose">
        {path === "/privacidade" ? (
          <>
            <h2>Dados e acesso</h2>
            <p>
              Guardamos conta, perfil, candidaturas e conversas. CPF/CNPJ são
              criptografados e não aparecem na busca. O empregador vê seu nome e
              apresentação quando você se candidata.
            </p>
            <h2>Conversas e histórico</h2>
            <p>
              Conversas ficam visíveis aos participantes. Experiências pessoais
              são autodeclaradas; as da plataforma dependem de confirmação das
              duas partes. Avaliações só aparecem após moderação.
            </p>
            <h2>Política institucional em elaboração</h2>
            <p>
              Responsável, bases legais, retenção e canal dos titulares aguardam
              validação institucional. Até lá, use apenas dados de teste.
            </p>
            <ActionLink href="/contato" secondary>
              Solicitar apoio
            </ActionLink>
          </>
        ) : path === "/contato" ? (
          <>
            <h2>Fale com o sindicato</h2>
            <p>Envie uma solicitação e acompanhe o retorno pela sua conta.</p>
            <ActionLink href="/atendimento">Pedir orientação</ActionLink>
          </>
        ) : (
          <>
            <h2>Para trabalhadores</h2>
            <ol>
              <li>Crie sua conta e perfil.</li>
              <li>Busque vagas e acompanhe candidaturas.</li>
              <li>Converse e registre experiências.</li>
            </ol>
            <h2>Para empregadores</h2>
            <ol>
              <li>Crie seu cadastro.</li>
              <li>Publique uma vaga com condições claras.</li>
              <li>Analise candidaturas e converse pela plataforma.</li>
            </ol>
            <p>
              A plataforma facilita o contato. Não garante contratação nem
              substitui obrigações trabalhistas.
            </p>
            <ActionLink href="/cadastro">Começar agora</ActionLink>
          </>
        )}
      </div>
    </section>
  );
}
