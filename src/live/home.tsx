"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useLive } from "./provider";
import { money } from "./ui";
import { useEditorialMotion } from "./motion";
import { TextReveal } from "./motion/components";

export function Home() {
  const { state, ready, connectionError, refresh } = useLive();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [retrying, setRetrying] = useState(false);
  useEditorialMotion(root);
  const jobs =
    state?.jobs.filter((job) => job.status === "Publicada").slice(0, 3) ?? [];
  return (
    <div className="editorial-home" ref={root}>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-portrait" aria-hidden="true">
          <div className="portrait-parallax">
            <Image
              src="/images/cinematic-v6/hero.webp"
              alt=""
              fill
              sizes="(max-width: 600px) 630px, max(85vw, 150svh)"
              preload
            />
          </div>
        </div>
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="home-frame home-hero-inner">
          <div className="home-hero-caption home-kicker">
            <span>Trabalho doméstico. Conexões humanas.</span>
            <span>Ribeirão Preto e região</span>
          </div>
          <h1 id="home-title" tabIndex={-1}>
            <span className="hero-line home-title-opening">
              <span>Quem cuida</span>
            </span>{" "}
            <span className="home-title-ending">
              <span className="hero-line home-title-bridge">
                <span>merece</span>
              </span>{" "}
              <span className="hero-line home-title-respect">
                <span>respeito.</span>
              </span>
            </span>
          </h1>
          <div className="home-hero-bottom">
            <div className="home-hero-intro">
              <p>
                Seu trabalho tem valor.
                <br />
                Sua próxima conexão começa aqui.
              </p>
              <div className="hero-actions">
                <Link className="home-button primary" href="/vagas">
                  Encontrar trabalho <Icon name="arrow" size={20} />
                </Link>
                <Link className="home-inline" href="/cadastro?tipo=empregador">
                  Quero contratar
                </Link>
              </div>
            </div>
            <form
              className="hero-quick-search"
              action="/vagas"
              method="get"
              onSubmit={(event) => {
                event.preventDefault();
                router.push("/vagas?q=" + encodeURIComponent(query.trim()));
              }}
            >
              <label className="home-kicker" htmlFor="home-query">
                Qual é a sua próxima oportunidade?
              </label>
              <div className="home-search-control">
                <input
                  id="home-query"
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Diarista, babá, cuidador…"
                />
                <button type="submit" aria-label="Buscar vagas">
                  <Icon name="search" size={22} />
                </button>
              </div>
            </form>
          </div>
          <div className="home-hero-base">
            <Link className="home-inline home-union-link" href="/atendimento">
              <span>Com o apoio do SINTEDORP</span>
            </Link>
            <a className="home-scroll-link home-kicker" href="#nosso-proposito">
              Conheça o Conecta
            </a>
          </div>
        </div>
      </section>
      <section
        className="home-manifesto home-frame"
        id="nosso-proposito"
        aria-labelledby="manifesto-title"
      >
        <div className="home-section-label">
          <span className="home-kicker">O que nos conecta</span>
        </div>
        <div className="home-manifesto-grid">
          <h2 id="manifesto-title">
            <TextReveal>
              Trabalho doméstico
              <br />é <em>trabalho.</em>
            </TextReveal>
          </h2>
          <div className="home-manifesto-note">
            <p>
              Quem cuida de uma casa faz parte da vida de alguém. E merece
              oportunidades com condições claras, diálogo e respeito.
            </p>
          </div>
        </div>
        <div className="home-manifesto-foot">
          <span className="home-kicker">
            Pessoas no centro. Respeito em cada conexão.
          </span>
          <p>
            O Conecta aproxima trabalhadores e empregadores, com orientação e
            acompanhamento do sindicato.
          </p>
        </div>
      </section>
      <section
        className="home-paths"
        aria-label="Encontre seu caminho no Conecta"
      >
        <Link
          className="home-path home-path-worker"
          href="/cadastro?tipo=trabalhador"
        >
          <span className="home-kicker">
            Para quem faz a diferença todos os dias
          </span>
          <h2>
            Procuro
            <br />
            trabalho<span>.</span>
          </h2>
          <div className="home-path-bottom">
            <p>
              Seu perfil, sua experiência.
              <br />
              Encontre uma nova oportunidade.
            </p>
            <span className="home-path-action">
              <span>Criar meu perfil</span>
            </span>
          </div>
        </Link>
        <Link
          className="home-path home-path-employer"
          href="/cadastro?tipo=empregador"
        >
          <span className="home-kicker">Para quem precisa de cuidado</span>
          <h2>
            Quero
            <br />
            contratar<span>.</span>
          </h2>
          <div className="home-path-bottom">
            <p>
              Publique sua vaga com clareza.
              <br />
              Conheça quem pode trabalhar com você.
            </p>
            <span className="home-path-action">
              <span>Criar minha conta</span>
            </span>
          </div>
        </Link>
      </section>
      <section
        className="home-jobs home-frame portal-content"
        aria-labelledby="home-jobs-title"
        data-job-state={
          jobs.length
            ? "published"
            : !ready
              ? "loading"
              : connectionError
                ? "error"
                : "empty"
        }
      >
        <div className="home-section-label">
          <span className="home-kicker">Oportunidades reais</span>
        </div>
        <div className="home-jobs-heading">
          <h2 id="home-jobs-title">
            {jobs.length ? (
              <TextReveal>
                Vagas em
                <br />
                <em>destaque.</em>
              </TextReveal>
            ) : (
              <TextReveal>
                Vagas <em>e oportunidades.</em>
              </TextReveal>
            )}
          </h2>
          <div>
            <p>
              {jobs.length ? (
                <>
                  Condições analisadas pelo sindicato.
                  <br />
                  Encontre um trabalho que combine com você.
                </>
              ) : (
                "Trabalho doméstico em Ribeirão Preto e região."
              )}
            </p>
            {jobs.length > 0 && (
              <Link className="home-inline" href="/vagas">
                Explorar todas as vagas
              </Link>
            )}
          </div>
        </div>
        {jobs.length > 0 && (
          <nav
            className="care-categories"
            aria-label="Encontre vagas por atividade"
          >
            {["Doméstica", "Diarista", "Babá", "Cuidador de idosos"].map(
              (label) => (
                <Link
                  key={label}
                  href={"/vagas?funcao=" + encodeURIComponent(label)}
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
        )}
        {jobs.length ? (
          <ul className="home-job-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={"/vagas/" + job.id} className="opportunity-row">
                  <div className="home-job-description">
                    <span className="home-kicker">{job.category}</span>
                    <h3>{job.title}</h3>
                    <p>
                      {job.region}
                      <span aria-hidden="true"> · </span>
                      {job.schedule}
                      {job.hours && ` · ${job.hours}`}
                    </p>
                  </div>
                  <div className="home-job-pay">
                    <strong>{money(job.salary_cents)}</strong>
                    <span>por {job.period.toLowerCase()}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="opportunities-empty" aria-busy={!ready || retrying}>
            <div role="status">
              <h3>
                {!ready
                  ? "Carregando oportunidades…"
                  : connectionError
                    ? "Oportunidades indisponíveis no momento."
                    : "Nenhuma vaga publicada no momento."}
              </h3>
              <p>
                {!ready
                  ? "Estamos consultando as vagas disponíveis."
                  : connectionError
                    ? "Não conseguimos consultar as vagas agora. Tente novamente em instantes."
                    : "As oportunidades aparecem aqui após a aprovação do sindicato. Enquanto isso, crie seu perfil para se candidatar quando houver vagas."}
              </p>
              <noscript>
                Ative o JavaScript para consultar as vagas atualizadas.
              </noscript>
            </div>
            {ready &&
              (connectionError ? (
                <button
                  className="home-button home-button-outline"
                  disabled={retrying}
                  onClick={async () => {
                    if (retrying) return;
                    setRetrying(true);
                    try {
                      await refresh();
                    } finally {
                      setRetrying(false);
                    }
                  }}
                >
                  {retrying ? "Tentando novamente…" : "Tentar novamente"}
                </button>
              ) : (
                <Link className="home-inline" href="/cadastro">
                  Criar meu perfil
                </Link>
              ))}
          </div>
        )}
      </section>
      <section className="home-union" aria-labelledby="care-title">
        <div className="home-frame home-union-grid">
          <div className="home-union-heading">
            <span className="home-kicker">Presença sindical</span>
            <h2 id="care-title">
              <TextReveal>
                O sindicato,
                <br />
                perto de <em>você.</em>
              </TextReveal>
            </h2>
          </div>
          <div className="home-union-copy">
            <p>
              Há momentos em que uma boa orientação faz diferença. O SINTEDORP
              tem espaço para ouvir, dialogar e acompanhar suas questões de
              trabalho.
            </p>
            <Link className="home-button" href="/atendimento">
              Solicitar atendimento
            </Link>
            <div className="home-union-details">
              <span>
                Envie sua solicitação e acompanhe o retorno pela sua conta.
              </span>
              <Link className="home-inline" href="/contato">
                Fale com o SINTEDORP
              </Link>
              <Link className="home-inline" href="/entrar">
                Acesse sua conta
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="home-guide home-frame" aria-labelledby="guide-title">
        <div className="home-section-label">
          <span className="home-kicker">Do primeiro passo ao encontro</span>
        </div>
        <div className="home-guide-grid">
          <div>
            <h2 id="guide-title">
              Mais simples
              <br />
              se <em>conectar.</em>
            </h2>
            <Link href="/como-funciona" className="home-inline">
              Conheça a plataforma
            </Link>
          </div>
          <ol className="home-steps">
            <li>
              <span className="home-step-number">01</span>
              <div>
                <h3>
                  <Link href="/cadastro">Conte sua história.</Link>
                </h3>
                <p>
                  Crie sua conta e complete seu perfil como trabalhador ou
                  empregador.
                </p>
              </div>
            </li>
            <li>
              <span className="home-step-number">02</span>
              <div>
                <h3>
                  <Link href="/vagas">Encontre seu caminho.</Link>
                </h3>
                <p>
                  Candidate-se a uma oportunidade ou publique uma vaga para
                  análise do sindicato.
                </p>
              </div>
            </li>
            <li>
              <span className="home-step-number">03</span>
              <div>
                <h3>
                  <Link href="/painel">Comece uma conversa.</Link>
                </h3>
                <p>
                  Acompanhe candidaturas e converse pela plataforma. O sindicato
                  está por perto para orientar.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <nav className="home-resources" aria-label="Recursos do portal">
          <Link href="/painel" className="home-resource-main">
            <span className="home-kicker">Sua conta</span>
            <span className="home-resource-title">Minha área</span>
            <small>Perfil, candidaturas e acompanhamento.</small>
            <span className="home-resource-action">Acessar minha área</span>
          </Link>
          <Link href="/atendimento">
            <span className="home-resource-title">Atendimento sindical</span>
            <small>Orientação e acompanhamento.</small>
            <span className="home-resource-action">Acessar</span>
          </Link>
          <Link href="/privacidade">
            <span className="home-resource-title">Privacidade e dados</span>
            <small>Entenda como seus dados são utilizados.</small>
            <span className="home-resource-action">Acessar</span>
          </Link>
          <Link href="/vagas">
            <span className="home-resource-title">Consultar vagas</span>
            <small>Veja oportunidades disponíveis.</small>
            <span className="home-resource-action">Explorar</span>
          </Link>
        </nav>
      </section>
      <section className="home-closing" aria-labelledby="closing-title">
        <div className="home-frame">
          <span className="home-kicker">
            O próximo passo é seu. O caminho é com a gente.
          </span>
          <h2 id="closing-title">
            <TextReveal>
              Uma conexão.
              <br />
              Novos caminhos.
            </TextReveal>
          </h2>
          <div className="home-closing-bottom">
            <p>
              Trabalho, cuidado e respeito.
              <br />
              Vamos aproximar essas histórias?
            </p>
            <div>
              <Link href="/vagas" className="home-button">
                Encontrar oportunidades <Icon name="arrow" size={22} />
              </Link>
              <Link href="/cadastro" className="home-inline">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="home-platform-note">
        <p className="home-frame">
          A plataforma aproxima pessoas. Não garante contratação nem substitui
          obrigações trabalhistas. Imagem ilustrativa criada para este projeto.
        </p>
      </div>
    </div>
  );
}
