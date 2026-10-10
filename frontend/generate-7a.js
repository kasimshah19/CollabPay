const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
};

write('src/components/ui/Skeleton.tsx', `
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={\`bg-surface border border-line rounded-lg animate-pulse \${className}\`}
      aria-hidden="true"
    />
  );
}
`);

write('src/components/ui/EmptyState.tsx', `
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-line bg-surface">
      <div className="w-12 h-12 rounded-full bg-soft flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-sora text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
`);

write('src/components/ui/ErrorState.tsx', `
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-line bg-surface">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-bad" />
      </div>
      <h3 className="font-sora text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-line text-ink font-medium hover:bg-soft transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
`);

write('src/components/ui/ResponsiveList.tsx', `
import { ReactNode } from "react";

export function ResponsiveList({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {children}
    </div>
  );
}
`);

write('src/lib/api.ts', `
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}\${endpoint}\`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = \`Bearer \${token}\`;
    }
  } catch (e) {
    // SSR safe
  }

  try {
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }

    if (!res.ok) {
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new ApiError(res.status, 'UNKNOWN_ERROR', 'An unexpected error occurred');
      }
      throw new ApiError(
        res.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unexpected error occurred',
        data.error?.details
      );
    }
    
    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Network error. Please check your connection.');
  }
}
`);

write('src/lib/types/user.ts', `
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'brand' | 'creator';
  phone?: string;
  notificationPrefs?: {
    email: boolean;
    whatsapp: boolean;
  };
}
`);

console.log("Phase 7A basic components and utils written.");
