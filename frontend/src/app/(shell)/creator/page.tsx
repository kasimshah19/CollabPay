"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CreatorHome() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-sora text-3xl font-bold text-ink tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h2>
          <p className="text-muted mt-1">Here is your creator overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
