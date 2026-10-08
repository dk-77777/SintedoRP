"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useLive } from "./provider";
import { money } from "./ui";

export function Home() {
  const { state } = useLive();
  const router = useRouter();
  const scene = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const jobs =
    state?.jobs.filter((job) => job.status === "Publicada").slice(0, 3) ?? [];

  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    const motion = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (min-width: 900px)",
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const distance = motion.matches
        ? Math.max(-70, Math.min(70, -rect.top * 0.14))
        : 0;
      node.style.setProperty("--sculpture-offset", `${distance}px`);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="sculpture-home">
      <section className="home-scene" ref={scene} aria-labelledby="home-title">
        <div className="home-intro">
          <p className="home-kicker">
            Trabalho doméstico · Ribeirão Preto e região
          </p>
          <h1 id="home-title" tabIndex={-1}>
            <span>Quem cuida</span>
            <span>merece</span>
            <span className="home-title-accent">respeito.</span>
          </h1>
          <p className="home-lead">
            Boas oportunidades. Condições claras.
            <br />O apoio do SINTEDORP em cada conexão.
          </p>
          <div className="home-primary-actions">
            <Link href="/vagas" className="home-button home-button-primary">
              Encontrar trabalho <Icon name="arrow" size={18} />
            </Link>
            <Link
              href="/como-funciona"
              className="home-button home-button-secondary"
            >
              Como funciona
            </Link>
          </div>
          <Link href="/cadastro" className="home-employer-link">
            Quero contratar <Icon name="arrow" size={16} />
          </Link>
        </div>
        <figure className="home-sculpture">
          <div className="home-sculpture-motion">
            <Image
              src="/images/cuidado-escultura.webp"
              alt="Escultura em bronze de duas mãos sustentando uma casa, símbolo de cuidado e proteção."
              width={1024}
              height={1536}
              sizes="(max-width: 599px) 88vw, (max-width: 899px) 58vw, 650px"
              preload
              className="home-sculpture-image"
            />
          </div>
          <figcaption>
            O cuidado sustenta.
            <br />
            <span>O respeito conecta.</span>
          </figcaption>
        </figure>
        <div className="home-scene-foot">
          <Link href="/contato" className="home-union-link">
            <span className="home-union-symbol">
              <Icon name="shield" size={25} />
            </span>
            <span>
              <strong>Ao lado de quem trabalha.</strong>
              <small>
                Conheça o apoio do sindicato <Icon name="arrow" size={15} />
              </small>
            </span>
          </Link>
          <a href="#home-opportunities" className="home-scroll-link">
            Explore as oportunidades <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="home-search-section"
        aria-labelledby="home-search-title"
      >
        <div>
          <p className="home-kicker">Seu próximo passo</p>
          <h2 id="home-search-title">
            Um bom trabalho
            <br />
            começa com uma boa conexão.
          </h2>
        </div>
        <form
          className="home-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(`/vagas?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <label htmlFor="home-query">Que trabalho você procura?</label>
          <div className="home-search-controls">
            <span className="home-search-input">
              <Icon name="search" size={21} />
              <input
                id="home-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: diarista, babá, cuidador"
              />
            </span>
            <button className="home-button home-button-primary" type="submit">
              Buscar <Icon name="arrow" size={18} />
            </button>
          </div>
        </form>
      </section>

      <section
        id="home-opportunities"
        className="home-opportunities"
        aria-labelledby="home-jobs-title"
      >
        <div className="home-section-heading">
          <h2 id="home-jobs-title">Oportunidades abertas.</h2>
          <Link href="/vagas" className="home-text-link">
            Ver todas as vagas <Icon name="arrow" size={18} />
          </Link>
        </div>
        {jobs.length ? (
          <ul className="home-job-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/vagas/${job.id}`} className="home-job-row">
                  <div>
                    <span className="home-job-category">{job.category}</span>
                    <h3>{job.title}</h3>
                    <p>
                      {job.region} <span aria-hidden="true">·</span>{" "}
                      {job.schedule}
                    </p>
                  </div>
                  <div className="home-job-pay">
                    <strong>{money(job.salary_cents)}</strong>
                    <span>por {job.period.toLowerCase()}</span>
                  </div>
                  <span className="home-job-arrow">
                    <Icon name="arrow" size={23} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="home-empty">
            Novas oportunidades em breve. As vagas aparecem aqui após análise do
            sindicato.
          </p>
        )}
      </section>

      <section className="home-purpose" aria-labelledby="home-purpose-title">
        <p className="home-kicker">Conecta SINTEDORP</p>
        <div className="home-purpose-body">
          <h2 id="home-purpose-title">
            Cuidar de uma casa
            <br />é cuidar de uma vida.
          </h2>
          <div>
            <p>
              Aproximamos quem procura trabalho de quem precisa contratar, com
              espaço para diálogo e orientação sindical.
            </p>
            <Link href="/cadastro" className="home-text-link">
              Faça parte dessa conexão <Icon name="arrow" size={20} />
            </Link>
          </div>
        </div>
        <p className="home-purpose-note">
          A plataforma aproxima pessoas. Não garante contratação nem substitui
          obrigações trabalhistas.
        </p>
      </section>
    </div>
  );
}
