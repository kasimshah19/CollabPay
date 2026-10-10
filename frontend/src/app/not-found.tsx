import { EmptyState } from "@/components/ui/EmptyState";
import { FileQuestion } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <header className="flex items-center justify-between px-6 py-4 bg-surface/80 border-b border-line">
        <div className="font-sora font-bold text-xl text-ink tracking-tight">CollabPay</div>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <EmptyState
            icon={FileQuestion}
            title="Page not found"
            description="The page you are looking for doesn't exist or has been moved."
            actionLabel="Return Home"
            actionHref="/"
          />
        </div>
      </main>
    </div>
  );
}
