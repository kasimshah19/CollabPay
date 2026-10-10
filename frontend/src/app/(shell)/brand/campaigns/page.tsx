"use client";

import { useEffect, useState, Suspense } from "react";
import { useAsync } from "@/lib/useAsync";
import { getMyCampaigns } from "@/lib/api/campaigns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Money } from "@/components/ui/Money";
import { timeUntil } from "@/lib/datetime";
import Link from "next/link";
import { Plus, Briefcase, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "open" | "cancelled">("all");
  
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageParam);
  
  const { data: campaigns, loading, error, execute } = useAsync(getMyCampaigns);

  useEffect(() => {
    execute(page, 20);
  }, [execute, page]);

  // Update URL on page change without reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    router.replace(`/brand/campaigns?${params.toString()}`, { scroll: false });
  }, [page, router]);

  if (loading && !campaigns) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load campaigns" message={error.message} onRetry={() => execute(page, 20)} />;
  }

  const filtered = campaigns?.filter(c => {
    if (filter === "all") return true;
    return c.status === filter;
  }) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-bold text-ink">Campaigns</h1>
          <p className="text-muted mt-1">Manage your campaigns, track budgets and applicants.</p>
        </div>
        <Link href="/brand/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New campaign
          </Button>
        </Link>
      </div>

      {campaigns && campaigns.length > 0 && (
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {(["all", "open", "cancelled"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === f 
                  ? "bg-primary text-white border-primary" 
                  : "bg-surface text-muted border-line hover:border-ink hover:text-ink"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {campaigns?.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description="You haven't created any campaigns yet."
          icon={Briefcase}
          action={{
            label: "Create one now",
            href: "/brand/campaigns/new",
            icon: Plus
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${filter} campaigns`}
          description="Try changing your filters to see more results."
          icon={Briefcase}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const paidPct = Math.min(100, Math.floor(((c.paidPaise || 0) / c.budgetPaise) * 100));
            const reservedPct = Math.min(100, Math.floor(((c.reservedPaise || 0) / c.budgetPaise) * 100));
            const slotsPct = Math.min(100, Math.floor((c.approvedCount / c.slots) * 100));
            
            return (
              <Link key={c._id} href={`/brand/campaigns/${c._id}`} className="group">
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow border-line hover:border-primary/50 group-focus-visible:ring-2 group-focus-visible:ring-primary outline-none">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-sora font-semibold text-lg text-ink line-clamp-2">{c.title}</h3>
                      <StatusPill status={c.status} className="shrink-0" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted mb-6">
                      <Calendar className="w-4 h-4" />
                      {c.status === "open" ? timeUntil(c.applicationDeadline) : "Closed"}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-muted mb-1 font-medium">
                          <span>Slots filled</span>
                          <span>{c.approvedCount} of {c.slots}</span>
                        </div>
                        <ProgressBar value={slotsPct} ariaLabel="Slots filled" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-muted mb-1 font-medium">
                          <span>Budget usage</span>
                          <span><Money paise={c.budgetPaise} /> total</span>
                        </div>
                        <ProgressBar value={paidPct} reserved={reservedPct} ariaLabel="Budget usage" />
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-line bg-soft/50 rounded-b-2xl mt-auto">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted">Fee per creator</span>
                      <span className="text-ink"><Money paise={c.feePerCreatorPaise} /></span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {campaigns && campaigns.length === 20 && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={() => setPage(p => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  );
}
