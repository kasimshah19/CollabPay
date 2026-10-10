"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-bg">
          <ErrorState 
            title="A fatal error occurred"
            message={error.message || "Something went wrong on our end."}
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
