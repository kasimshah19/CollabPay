import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-line bg-surface">
      <div className="w-12 h-12 rounded-full bg-[color-mix(in_srgb,var(--bad)_16%,transparent)] flex items-center justify-center mb-4">
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
