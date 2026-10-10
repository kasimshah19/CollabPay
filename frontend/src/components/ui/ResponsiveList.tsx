import { ReactNode } from "react";
import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";
import { StatusPill } from "./StatusPill";

export function ResponsiveList({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {children}
    </div>
  );
}

export interface ResponsiveListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  subtitleSuffix?: ReactNode;
  status?: "pending" | "approved" | "rejected" | "open" | "draft" | "cancelled" | "completed" | "submitted" | "revision_requested";
  href: string;
  icon?: LucideIcon;
  rightElement?: ReactNode;
}

export function ResponsiveListItem({
  title,
  subtitle,
  subtitleSuffix,
  status,
  href,
  icon: Icon,
  rightElement
}: ResponsiveListItemProps) {
  return (
    <Link 
      href={href} 
      className="group block bg-surface border border-line rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all focus-ring"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-soft text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-sora font-semibold text-ink truncate">{title}</h4>
            {status && <StatusPill status={status} className="shrink-0" />}
          </div>
          {(subtitle || subtitleSuffix) && (
            <p className="text-sm text-muted truncate">
              {subtitle}{subtitleSuffix}
            </p>
          )}
        </div>
        
        {rightElement ? (
          <div className="shrink-0 pl-2">
            {rightElement}
          </div>
        ) : (
          <div className="shrink-0 text-muted group-hover:text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
      </div>
    </Link>
  );
}
