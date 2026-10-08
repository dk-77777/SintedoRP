"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useLive } from "./provider";
import type { JobRow } from "./types";
import { Icon } from "@/components/icon";
export function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
export function displayDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return value.split("-").reverse().join("/");
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
export const value = (form: FormData, name: string) =>
  String(form.get(name) ?? "").trim();
export function ConfirmAction({
  label,
  title,
  description,
  action,
  destructive = false,
}: {
  label: string;
  title: string;
  description: string;
  action: Record<string, unknown>;
  destructive?: boolean;
}) {
  const { act, busy } = useLive();
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [error, setError] = useState("");
  return (
    <>
      <button
        data-confirmation-target={`${id}-dialog`}
        className={destructive ? "text-button danger" : "button secondary"}
        disabled={busy}
        onClick={() => {
          setError("");
          dialog.current?.showModal();
        }}
      >
        {label}
      </button>
      <dialog
        id={`${id}-dialog`}
        ref={dialog}
        className="confirmation-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <span className="confirmation-icon">
          <Icon name={destructive ? "alert" : "info"} size={25} />
        </span>
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-description`}>{description}</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="inline-actions">
          <button
            data-dialog-close="true"
            className="button secondary"
            autoFocus
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            Cancelar
          </button>
          <button
            className={`button ${destructive ? "destructive" : "primary"}`}
            disabled={busy}
            onClick={async () => {
              const result = await act(action, setError);
              if (result) dialog.current?.close();
            }}
          >
            {busy ? "Registrando…" : label}
          </button>
        </div>
      </dialog>
    </>
  );
}
export function MutationForm({
  children,
  build,
  onSuccess,
  reset = false,
  label,
}: {
  children: React.ReactNode;
  build: (form: FormData) => Record<string, unknown>;
  onSuccess?: (id?: string) => void;
  reset?: boolean;
  label?: string;
}) {
  const { act, busy, notify } = useLive();
  const [formError, setFormError] = useState("");
  return (
    <form
      aria-label={label}
      aria-busy={busy}
      className="form-card live-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setFormError("");
        try {
          const result = await act(build(new FormData(form)), setFormError);
          if (result) {
            if (reset) form.reset();
            onSuccess?.(result.id);
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Confira os dados.";
          setFormError(message);
          notify(message, "error");
        }
      }}
    >
      <fieldset disabled={busy}>{children}</fieldset>
      {busy && (
        <p className="submission-status" role="status">
          Salvando alterações…
        </p>
      )}
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
    </form>
  );
}
export function JobCard({ job }: { job: JobRow }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className="category-icon">
          <Icon
            name={/Babá|Cuidador/.test(job.category) ? "heart" : "home"}
            size={23}
          />
        </span>
        <span className="mini-label">{job.schedule}</span>
      </div>
      <p className="job-category">{job.category}</p>
      <h3>
        <Link href={`/vagas/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="job-location">
        <Icon name="pin" size={16} />
        {job.region}
      </p>
      <p className="job-employer">{job.employer_name}</p>
      <div className="job-card-bottom">
        <p>
          <strong>{money(job.salary_cents)}</strong>
          <span> / {job.period.toLowerCase()}</span>
        </p>
        <Link
          href={`/vagas/${job.id}`}
          className="job-detail-link"
          aria-label={`Ver vaga: ${job.title}`}
        >
          Ver vaga <Icon name="arrow" size={16} />
        </Link>
      </div>
      <p className="verified">
        <Icon name="shield" size={14} />
        Condições analisadas pelo sindicato
      </p>
    </article>
  );
}
