import React from "react";

interface StatusPillProps {
  tone?: "neutral" | "ok" | "warn" | "bad";
  children: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({ tone = "neutral", children }) => {
  const toneClasses = {
    neutral: "bg-[color-mix(in_srgb,var(--muted)_16%,transparent)] text-muted",
    ok: "bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-ok",
    warn: "bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-warn",
    bad: "bg-[color-mix(in_srgb,var(--bad)_16%,transparent)] text-bad",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};
