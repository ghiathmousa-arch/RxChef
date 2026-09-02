import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3.5 text-[13px] tracking-[0.1em] text-sand">{children}</p>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border border-sand/40 bg-paper shadow-[0_22px_50px_-38px_rgba(9,72,61,0.34)] ${className}`}
    >
      {children}
    </div>
  );
}

const buttonClass =
  "inline-flex items-center gap-3 rounded-2xl bg-teal px-9 py-4 text-[17px] font-medium text-cream shadow-[0_14px_30px_-18px_rgba(9,72,61,0.5)] transition-[box-shadow,transform,background] duration-300 hover:bg-teal-dark hover:shadow-[0_16px_42px_-12px_rgba(216,154,131,0.72)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-[0_14px_30px_-18px_rgba(9,72,61,0.5)]";

export function PrimaryButton({
  href,
  onClick,
  children,
  disabled,
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  if (href) {
    return (
      <a href={href} className={buttonClass}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={buttonClass}>
      {children}
    </button>
  );
}

export type Tone = "ok" | "warn" | "bad" | "muted";

export const TONE: Record<Tone, { color: string; bg: string }> = {
  ok: { color: "#348F80", bg: "rgba(52,143,128,.10)" },
  warn: { color: "#C08A3E", bg: "rgba(192,138,62,.12)" },
  bad: { color: "#B5473A", bg: "rgba(181,71,58,.10)" },
  muted: { color: "#AFB8B5", bg: "rgba(175,184,181,.16)" },
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <span
      className="whitespace-nowrap rounded-[9px] px-2.5 py-1 text-[13px]"
      style={{ color: t.color, background: t.bg }}
    >
      {children}
    </span>
  );
}
