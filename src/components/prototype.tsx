"use client";

import Link from "@/demo/navigation";
import { useRouter } from "@/demo/navigation";
import { useEffect, useState } from "react";
import { useDemo } from "@/demo/provider";
import type { Role } from "@/demo/data";
import { Icon } from "./icon";
import {
  HomePage,
  JobsPage,
  JobDetail,
  AccessPage,
  RegistrationPage,
  InfoPage,
  RecoveryPage,
} from "./public-pages";
import { WorkspacePage } from "./workspace-pages";
import { Empty, ActionLink } from "./ui";

export const roleNames: Record<Role, string> = {
  trabalhador: "Trabalhador",
  empregador: "Empregador",
  sindicato: "Sindicato",
};

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Conecta SINTEDORP, início">
      <span className="brand-mark">
        <Icon name="leaf" size={30} />
      </span>
      <span>
        conecta<span className="brand-sub">SINTEDORP</span>
      </span>
    </Link>
  );
}

export function Prototype({ path }: { path: string }) {
  const { state, ready, reset, notice, notify } = useDemo();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);
  const privateArea =
    path.startsWith("/trabalhador") ||
    path.startsWith("/empregador") ||
    path.startsWith("/sindicato") ||
    path.startsWith("/mensagens");
  const requiredRole = path.startsWith("/trabalhador")
    ? "trabalhador"
    : path.startsWith("/empregador")
      ? "empregador"
      : path.startsWith("/sindicato")
        ? "sindicato"
        : null;
  const allowed =
    state.role &&
    (!requiredRole || state.role === requiredRole) &&
    !(path.startsWith("/mensagens") && state.role === "sindicato");
  let content: React.ReactNode;
  if (privateArea && !ready)
    content = (
      <div className="container loading" role="status">
        Preparando a demonstração…
      </div>
    );
  else if (privateArea && !allowed)
    content = (
      <div className="container gate">
        <Empty
          title="Escolha um perfil de demonstração"
          description={`Esta área representa o perfil ${requiredRole ? roleNames[requiredRole] : "dos participantes da conversa"}. O acesso aqui é apenas uma simulação de navegação.`}
        >
          <ActionLink href="/entrar">
            Escolher perfil <Icon name="arrow" />
          </ActionLink>
        </Empty>
      </div>
    );
  else if (privateArea) content = <WorkspacePage path={path} />;
  else if (path === "/") content = <HomePage />;
  else if (path === "/vagas") content = <JobsPage />;
  else if (path.startsWith("/vagas/"))
    content = <JobDetail id={path.split("/")[2]} />;
  else if (path === "/entrar") content = <AccessPage />;
  else if (path === "/cadastro") content = <RegistrationPage />;
  else if (path === "/recuperar-acesso") content = <RecoveryPage />;
  else if (["/como-funciona", "/privacidade", "/contato"].includes(path))
    content = <InfoPage path={path} />;
  else
    content = (
      <div className="container gate">
        <Empty
          title="Página não encontrada"
          description="Volte ao início para continuar explorando o protótipo."
        >
          <ActionLink href="/">Voltar ao início</ActionLink>
        </Empty>
      </div>
    );

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="demo-ribbon">
        <div className="container ribbon-inner">
          <span>
            <span className="live-dot" />
            Protótipo · dados fictícios · use somente exemplos
          </span>
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="ribbon-reset"
          >
            Reiniciar demonstração <Icon name="back" size={13} />
          </button>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            aria-label="Navegação principal"
            className={`header-nav ${menuOpen ? "open" : ""}`}
          >
            <Link
              href="/vagas"
              aria-current={path === "/vagas" ? "page" : undefined}
            >
              Encontrar trabalho
            </Link>
            <Link
              href="/como-funciona"
              aria-current={path === "/como-funciona" ? "page" : undefined}
            >
              Como funciona
            </Link>
            <Link href="/contato">O sindicato</Link>
            <Link className="mobile-access" href="/entrar">
              Escolher perfil
            </Link>
          </nav>
          <div className="header-actions">
            {state.role ? (
              <Link href={`/${state.role}`} className="account-link">
                <Icon name="user" size={17} />
                {roleNames[state.role]}
              </Link>
            ) : (
              <Link href="/entrar" className="text-link">
                Entrar
              </Link>
            )}
            <Link
              href={
                state.role === "empregador"
                  ? "/empregador/vagas/nova"
                  : "/cadastro"
              }
              className="button primary small"
            >
              {state.role === "empregador" ? "Publicar vaga" : "Começar agora"}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>
      {notice && (
        <div className="container">
          <div className="feedback" role="status">
            <Icon name="check" />
            <span>{notice}</span>
            <button aria-label="Fechar aviso" onClick={() => notify("")}>
              <Icon name="close" size={17} />
            </button>
          </div>
        </div>
      )}
      <main id="conteudo">{content}</main>
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
            <Link href="/entrar">Explorar os três perfis</Link>
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
          <span>Protótipo acadêmico. Identidade visual proposta.</span>
          <span>Feito para aproximar pessoas.</span>
        </div>
      </footer>
    </>
  );
}
