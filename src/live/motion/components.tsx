"use client";
import { useId, type ReactNode } from "react";

/** Decorative identity; unique gradient ids support multiple instances and SSR. */
export function ConectaFlow({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`conecta-flow ${className}`}
      viewBox="0 0 1000 620"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={id}
          x1="70"
          y1="530"
          x2="830"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AF4513" stopOpacity="0" />
          <stop offset=".3" stopColor="#FF743A" />
          <stop offset=".62" stopColor="#FFD0A3" />
          <stop offset=".85" stopColor="#FF743A" />
          <stop offset="1" stopColor="#AF4513" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <path
        className="flow-halo"
        d="M-80 580C100 535 723 105 796 236C882 390 398 516 373 316C350 126 712 69 1090 186"
        stroke={`url(#${id})`}
        strokeWidth="26"
      />
      <path
        className="flow-ribbon"
        pathLength="1"
        d="M-80 580C100 535 723 105 796 236C882 390 398 516 373 316C350 126 712 69 1090 186"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        className="flow-thread"
        pathLength="1"
        d="M-80 604C100 559 717 133 785 245C859 371 423 490 398 320C375 150 712 93 1090 210"
        stroke={`url(#${id})`}
        strokeWidth="1"
      />
    </svg>
  );
}

export function TextReveal({
  children,
  variant = "line",
}: {
  children: ReactNode;
  variant?: "line" | "horizontal";
}) {
  return (
    <span className="text-reveal" data-reveal={variant}>
      <span>{children}</span>
    </span>
  );
}

export function ImageReveal({
  children,
  className = "",
  variant = "curtain",
}: {
  children: ReactNode;
  className?: string;
  variant?: "curtain" | "scale";
}) {
  return (
    <figure className={`image-reveal ${className}`} data-image-reveal={variant}>
      {children}
    </figure>
  );
}
