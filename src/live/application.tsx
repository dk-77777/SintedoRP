"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { ActionLink, Empty, Field, Title } from "@/components/ui";
import { LiveProvider, useLive } from "./provider";
import { authClient } from "./auth-client";
import { Home, Jobs, JobDetail, Access, Profile, Info } from "./public";
import {
  Accounts,
  Applications,
  Cases,
  Dashboard,
  EmployerJobs,
  History,
  JobForm,
  Messages,
  ModerationJobs,
  Reports,
  Reviews,
  WorkerProfile,
} from "./workspace";
function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Conecta SINTEDORP, início">
      <span className="brand-mark">
        <Icon name="leaf" size={30} />
      </span>
      <span>
        conecta<span className="brand-sub">SINTEDORP</span>
      </span>
    </Link>
  );
}
const staff = ["ADMIN", "MODERATOR", "ANALYST"];
function Shell({ path, demoEnabled }: { path: string; demoEnabled: boolean }) {
  const {
    state,
    ready,
    notice,
    noticeTone,
    connectionError,
    notify,
    act,
    busy,
    refresh,
  } = useLive();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [workspaceMenu, setWorkspaceMenu] = useState(false);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    setMenu(false);
    setWorkspaceMenu(false);
    if (ready)
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
  }, [path, ready]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (workspaceMenu)
          document.getElementById("workspace-menu-toggle")?.focus();
        else if (menu) document.getElementById("public-menu-toggle")?.focus();
        setMenu(false);
        setWorkspaceMenu(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu, workspaceMenu]);
  const retry = async () => {
    setRetrying(true);
    await refresh();
    setRetrying(false);
  };
  const user = state?.user;
  const privateArea = [
    "/painel",
    "/trabalhador",
    "/empregador",
    "/sindicato",
    "/mensagens",
    "/atendimento",
  ].some((p) => path === p || path.startsWith(p + "/"));
  const required = path.startsWith("/sindicato")
    ? staff
    : path.startsWith("/empregador")
      ? ["empregador"]
      : path.startsWith("/trabalhador")
        ? ["trabalhador"]
        : null;
  const allowed =
    !!user && (!required || required.some((r) => user.roles.includes(r)));
  let content: React.ReactNode;
  if (!ready)
    content = (
      <section className="container page-section">
        <h1 tabIndex={-1}>Carregando</h1>
        <p role="status">Só um momento…</p>
      </section>
    );
  else if (!state && connectionError)
    content = (
      <section className="container page-section narrow-page connection-error">
        <Title
          title="Não foi possível carregar a plataforma"
          description="Confira sua conexão e tente novamente. Nenhuma informação foi enviada."
        />
        <button
          className="button primary"
          disabled={retrying}
          onClick={() => void retry()}
        >
          {retrying ? "Tentando novamente…" : "Tentar novamente"}
        </button>
      </section>
    );
  else if (privateArea && !allowed)
    content = (
      <section className="container page-section">
        <Title
          title={
            user ? "Perfil sem acesso a esta área" : "Entre para continuar"
          }
        />
        <Empty
          title={
            user
              ? "Selecione uma área do seu perfil"
              : "Sua conta, suas conexões"
          }
          description={
            user
              ? "O acesso depende das permissões concedidas à sua conta."
              : "Confirme seu e-mail e entre para acompanhar suas oportunidades."
          }
        >
          <ActionLink href={user ? "/painel" : "/entrar"}>
            {user ? "Voltar ao painel" : "Entrar"}
          </ActionLink>
        </Empty>
      </section>
    );
  else if (path === "/") content = <Home />;
  else if (path === "/vagas") content = <Jobs />;
  else if (path.startsWith("/vagas/"))
    content = <JobDetail id={path.split("/")[2]} />;
  else if (path === "/entrar") content = <Access mode="login" />;
  else if (path === "/cadastro") content = <Access mode="signup" />;
  else if (path === "/recuperar-acesso") content = <Access mode="recover" />;
  else if (path === "/redefinir-senha") content = <Access mode="reset" />;
  else if (path === "/cadastro/perfil") content = <Profile />;
  else if (["/como-funciona", "/privacidade", "/contato"].includes(path))
    content = <Info path={path} />;
  else if (privateArea) {
    let page: React.ReactNode;
    if (["/painel", "/trabalhador", "/empregador", "/sindicato"].includes(path))
      page = <Dashboard />;
    else if (path === "/trabalhador/perfil") page = <WorkerProfile />;
    else if (path === "/empregador/vagas/nova") page = <JobForm />;
    else if (/^\/empregador\/vagas\/[^/]+\/editar$/.test(path))
      page = <JobForm id={path.split("/")[3]} />;
    else if (path === "/empregador/vagas") page = <EmployerJobs />;
    else if (
      path === "/sindicato/vagas" ||
      /^\/sindicato\/vagas\/[^/]+$/.test(path)
    )
      page = user?.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r)) ? (
        <ModerationJobs id={path.split("/")[3]} />
      ) : (
        <Denied />
      );
    else if (
      ["/trabalhador/candidaturas", "/empregador/candidatos"].includes(path)
    )
      page = <Applications />;
    else if (path.startsWith("/mensagens"))
      page = <Messages id={path.split("/")[2]} />;
    else if (["/trabalhador/historico", "/empregador/historico"].includes(path))
      page = <History />;
    else if (path.endsWith("/avaliacoes"))
      page =
        path.startsWith("/sindicato") &&
        !user?.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r)) ? (
          <Denied />
        ) : (
          <Reviews moderation={path.startsWith("/sindicato")} />
        );
    else if (path === "/sindicato/atendimentos" || path === "/atendimento")
      page =
        path.startsWith("/sindicato") &&
        !user?.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r)) ? (
          <Denied />
        ) : (
          <Cases moderation={path.startsWith("/sindicato")} />
        );
    else if (path === "/sindicato/cadastros")
      page = user?.roles.includes("ADMIN") ? <Accounts /> : <Denied />;
    else if (path === "/sindicato/relatorios") page = <Reports />;
    else page = <NotFound />;
    const role = user?.role ?? "trabalhador";
    const links =
      role === "sindicato"
        ? [
            ["/sindicato", "Visão geral"],
            ...(user?.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r))
              ? [
                  ["/sindicato/vagas", "Análise de vagas"],
                  ["/sindicato/avaliacoes", "Avaliações"],
                  ["/sindicato/atendimentos", "Atendimentos"],
                ]
              : []),
            ["/sindicato/relatorios", "Relatórios"],
            ...(user?.roles.includes("ADMIN")
              ? [["/sindicato/cadastros", "Cadastros"]]
              : []),
          ]
        : role === "empregador"
          ? [
              ["/empregador", "Visão geral"],
              ["/empregador/vagas", "Minhas vagas"],
              ["/empregador/candidatos", "Candidaturas"],
              ["/mensagens", "Mensagens"],
              ["/empregador/historico", "Experiências"],
              ["/empregador/avaliacoes", "Avaliações"],
              ["/atendimento", "Atendimento"],
            ]
          : [
              ["/trabalhador", "Visão geral"],
              ["/trabalhador/perfil", "Meu perfil"],
              ["/vagas", "Buscar vagas"],
              ["/trabalhador/candidaturas", "Candidaturas"],
              ["/mensagens", "Mensagens"],
              ["/trabalhador/historico", "Meu histórico"],
              ["/trabalhador/avaliacoes", "Avaliações"],
              ["/atendimento", "Atendimento"],
            ];
    content = (
      <div className="container live-workspace">
        <div className="workspace-mobile-bar">
          <span>
            <strong>
              {role === "sindicato"
                ? "Área sindical"
                : role === "empregador"
                  ? "Área do empregador"
                  : "Área do trabalhador"}
            </strong>
          </span>
          <button
            id="workspace-menu-toggle"
            className="button secondary small"
            aria-controls="workspace-navigation"
            aria-expanded={workspaceMenu}
            onClick={() => setWorkspaceMenu(!workspaceMenu)}
          >
            <Icon name={workspaceMenu ? "close" : "menu"} size={18} />{" "}
            {workspaceMenu ? "Fechar" : "Menu"}
          </button>
        </div>
        <aside
          id="workspace-navigation"
          className={`live-sidebar ${workspaceMenu ? "is-open" : ""}`}
          aria-label="Navegação da conta"
        >
          <p>
            <strong>{user?.name}</strong>
          </p>
          <Field label="Perfil ativo">
            <select
              value={role}
              disabled={busy}
              onChange={async (e) => {
                const role = e.target.value;
                const result = await act({ action: "role", role });
                if (result) router.push(`/${role}`);
              }}
            >
              {user?.roles.includes("trabalhador") && (
                <option value="trabalhador">Trabalhador</option>
              )}
              {user?.roles.includes("empregador") && (
                <option value="empregador">Empregador</option>
              )}
              {user?.roles.some((r) => staff.includes(r)) && (
                <option value="sindicato">Sindicato</option>
              )}
              {!user?.roles.length && (
                <option value="trabalhador">Perfil incompleto</option>
              )}
            </select>
          </Field>
          <nav aria-label="Sua área">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path === href ||
                  (path === "/painel" && href === `/${role}`) ||
                  ((href.split("/").length > 2 || href === "/mensagens") &&
                    path.startsWith(href + "/"))
                    ? "page"
                    : undefined
                }
              >
                <Icon
                  name={
                    label.includes("Mensagen")
                      ? "chat"
                      : label.includes("Relatório")
                        ? "chart"
                        : label.includes("Avalia")
                          ? "star"
                          : label.includes("perfil") || label === "Cadastros"
                            ? "user"
                            : label.includes("histórico") ||
                                label === "Experiências"
                              ? "clock"
                              : label.includes("Atendimento")
                                ? "heart"
                                : label === "Visão geral"
                                  ? "home"
                                  : "bag"
                  }
                  size={18}
                />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <Link className="text-link" href="/cadastro/perfil">
            Adicionar perfil
          </Link>
        </aside>
        <section className="live-workspace-content">{page}</section>
      </div>
    );
  } else
    content = (
      <section className="container page-section">
        <NotFound />
      </section>
    );
  return (
    <div className="live-application" data-private={privateArea}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="demo-ribbon">
        <div className="container ribbon-inner">
          <span>Desenvolvimento · use dados de teste</span>
          {demoEnabled && <Link href="/demo">Explorar demonstração</Link>}
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            id="public-navigation"
            className={`header-nav ${menu ? "open" : ""}`}
            aria-label="Navegação principal"
          >
            <Link href="/vagas">Vagas</Link>
            <Link href="/como-funciona">Como funciona</Link>
            <Link href="/contato">Sindicato</Link>
            <Link className="mobile-access" href={user ? "/painel" : "/entrar"}>
              {user ? "Minha área" : "Entrar"}
            </Link>
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link className="account-link" href="/painel">
                  <Icon name="user" size={17} />
                  Minha área
                </Link>
                <button
                  className="text-button"
                  onClick={async () => {
                    const result = await authClient.signOut();
                    if (result.error) {
                      notify(
                        "Não foi possível sair. Tente novamente.",
                        "error",
                      );
                      return;
                    }
                    await refresh();
                    router.push("/");
                  }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link className="text-link" href="/entrar">
                  Entrar
                </Link>
                <ActionLink href="/cadastro" small>
                  Começar agora <Icon name="arrow" size={17} />
                </ActionLink>
              </>
            )}
          </div>
          <button
            id="public-menu-toggle"
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="public-navigation"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
      </header>
      {notice && (
        <div className="container">
          <div
            className={`feedback feedback-${noticeTone}`}
            role={noticeTone === "error" ? "alert" : "status"}
          >
            <Icon
              name={
                noticeTone === "success"
                  ? "check"
                  : noticeTone === "error"
                    ? "alert"
                    : "info"
              }
            />
            <span>{notice}</span>
            <button aria-label="Fechar aviso" onClick={() => notify("")}>
              <Icon name="close" size={17} />
            </button>
          </div>
        </div>
      )}
      {state && connectionError && (
        <div className="container">
          <div className="feedback feedback-error" role="alert">
            <Icon name="alert" />
            <span>
              A atualização falhou. Os dados abaixo podem estar desatualizados.
            </span>
            <button
              className="text-button"
              disabled={retrying}
              onClick={() => void retry()}
            >
              {retrying ? "Atualizando…" : "Atualizar"}
            </button>
          </div>
        </div>
      )}
      <main id="conteudo" aria-busy={!ready}>
        {content}
      </main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div>
            <Brand />
            <p>
              Conexões que valorizam
              <br />
              quem cuida de tantas histórias.
            </p>
          </div>
          <div className="footer-links">
            <Link href="/como-funciona">Como funciona</Link>
            <Link href="/contato">Fale com o sindicato</Link>
            <Link href="/privacidade">Privacidade e dados</Link>
          </div>
          <div className="footer-note">
            <span className="eyebrow">PROJETO DE EXTENSÃO</span>
            <p>
              Conecta SINTEDORP
              <br />
              Ribeirão Preto · 2026
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            Identidade visual proposta. Política institucional em elaboração.
          </span>
          <span>Feito para aproximar pessoas.</span>
        </div>
      </footer>
    </div>
  );
}
function Denied() {
  return (
    <>
      <Title title="Acesso restrito" />
      <Empty
        title="Permissão específica necessária"
        description="Esta função depende da permissão concedida pelo operador."
      />
    </>
  );
}
function NotFound() {
  return (
    <>
      <Title title="Página não encontrada" />
      <ActionLink href="/">Voltar ao início</ActionLink>
    </>
  );
}
export function LiveApplication(props: { path: string; demoEnabled: boolean }) {
  return (
    <LiveProvider>
      <Shell {...props} />
    </LiveProvider>
  );
}
