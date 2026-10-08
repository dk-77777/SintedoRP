"use client";

import Link from "@/demo/navigation";
import { cloneElement, isValidElement, useId, type ReactElement } from "react";
import { Icon } from "./icon";
import { money, statusClass, type Job } from "@/demo/data";

export function ActionLink({
  href,
  children,
  secondary = false,
  small = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`button ${secondary ? "secondary" : "primary"} ${small ? "small" : ""}`}
    >
      {children}
    </Link>
  );
}
export function Badge({ children, tone }: { children: string; tone?: string }) {
  return (
    <span className={`badge ${tone || statusClass[children] || "gray"}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function Title({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const generatedId = useId();
  const element = children as ReactElement<{
    id?: string;
    "aria-describedby"?: string;
  }>;
  const id = element.props?.id || generatedId;
  const description =
    [element.props?.["aria-describedby"], hint ? `${id}-hint` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(element, { id, "aria-describedby": description })
        : children}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name="leaf" size={30} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span className={`avatar ${large ? "large" : ""}`} aria-hidden="true">
      {name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </span>
  );
}
export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className="category-icon">
          <Icon
            name={
              job.category === "Cuidador(a)" || job.category === "Babá"
                ? "heart"
                : "home"
            }
            size={25}
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
        {job.region}, Ribeirão Preto
      </p>
      <div className="job-card-bottom">
        <p>
          <strong>{money(job.salary)}</strong>
          <span> / {job.period}</span>
        </p>
        <Link
          href={`/vagas/${job.id}`}
          className="round-link"
          aria-label={`Ver vaga: ${job.title}`}
        >
          <Icon name="arrow" />
        </Link>
      </div>
      <p className="verified">
        <Icon name="shield" size={14} />
        Análise sindical simulada
      </p>
    </article>
  );
}
export function Stats({
  items,
}: {
  items: { label: string; value: number | string; icon: string }[];
}) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <Icon name={item.icon} />
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
export function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice-box">
      <Icon name="shield" size={22} />
      <div>{children}</div>
    </div>
  );
}
