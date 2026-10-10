import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, action }: EmptyStateProps) {
  const actualLabel = action?.label || actionLabel;
  const actualHref = action?.href || actionHref;
  const ActionIcon = action?.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-line bg-surface">
      <div className="w-12 h-12 rounded-full bg-soft flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-sora text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{description}</p>
      {actualLabel && actualHref && (
        <Link 
          href={actualHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {actualLabel}
        </Link>
      )}
    </div>
  );
}
