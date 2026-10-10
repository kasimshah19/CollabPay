"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAsync } from "@/lib/useAsync";
import { getMyCampaigns, Campaign } from "@/lib/api/campaigns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import Link from "next/link";
import { Plus, Briefcase, FileText, Activity, AlertCircle } from "lucide-react";
import { ResponsiveList, ResponsiveListItem } from "@/components/ui/ResponsiveList";

export default function BrandDashboard() {
  const { user } = useAuth();
  const { data: campaigns, loading, error, execute } = useAsync(getMyCampaigns);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading && !campaigns) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-8 w-48 mt-8 mb-4" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load dashboard" message={error.message} onRetry={execute} />;
  }

  const activeCampaigns = campaigns?.filter(c => c.status === "open") || [];
  const reservedTotal = campaigns?.reduce((acc, c) => acc + (c.reservedPaise || 0), 0) || 0;
  const paidTotal = campaigns?.reduce((acc, c) => acc + (c.paidPaise || 0), 0) || 0;

  // We don't have pending reviews data from the list API, so we fallback to 0.
  const pendingReviews = campaigns?.reduce((acc, c) => acc + (c.applicationCounts?.pending || 0), 0) || 0;

  // For "Needs your attention", we could filter by campaigns that have pending counts if available,
  // otherwise just show recent active campaigns. Since we don't have pending counts in list, 
  // we'll show active campaigns.
  const attentionCampaigns = activeCampaigns.slice(0, 5);

  if (campaigns?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <EmptyState
          title="Create your first campaign"
          description="You don't have any campaigns yet. Start collaborating with creators today."
          icon={Briefcase}
          action={{
            label: "New campaign",
            href: "/brand/campaigns/new",
            icon: Plus
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-bold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted mt-1">Here is what is happening with your campaigns today.</p>
        </div>
        <Link href="/brand/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-medium text-sm">Active campaigns</h3>
          </div>
          <div className="text-3xl font-sora font-semibold text-ink">{activeCampaigns.length}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-gold">
          <div className="flex items-center gap-3 text-muted mb-2">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-medium text-sm">Budget reserved</h3>
          </div>
          <div className="text-3xl font-sora font-semibold text-gold">
            <Money paise={reservedTotal} />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-gold">
          <div className="flex items-center gap-3 text-muted mb-2">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-medium text-sm">Paid out</h3>
          </div>
          <div className="text-3xl font-sora font-semibold text-gold">
            <Money paise={paidTotal} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-medium text-sm">Pending reviews</h3>
          </div>
          <div className="text-3xl font-sora font-semibold text-ink">
            {pendingReviews > 0 ? pendingReviews : "-"}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="font-sora text-xl font-bold text-ink mb-4">Needs your attention</h2>
        {attentionCampaigns.length > 0 ? (
          <ResponsiveList>
            {attentionCampaigns.map(c => (
              <ResponsiveListItem
                key={c._id}
                title={c.title}
                subtitle={`${c.slotsLeft} slots left • Reserved: `}
                subtitleSuffix={<Money paise={c.reservedPaise} className="text-gold font-medium inline" />}
                status={c.status}
                href={`/brand/campaigns/${c._id}`}
                icon={AlertCircle}
              />
            ))}
          </ResponsiveList>
        ) : (
          <Card className="p-8 text-center text-muted">
            You&apos;re all caught up! No campaigns need immediate attention.
          </Card>
        )}
      </div>
    </div>
  );
}
