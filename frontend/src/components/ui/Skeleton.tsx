import { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface border border-line rounded-lg animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
