"use client";

import { useEffect, useState, use } from "react";
import { useAsync } from "@/lib/useAsync";
import { getCampaign, Campaign } from "@/lib/api/campaigns";
import { getCampaignApplications, approveApplication, rejectApplication, Application } from "@/lib/api/applications";
import { getCampaignSubmissions, approveSubmission, requestRevision, rejectSubmission, Submission } from "@/lib/api/submissions";
import { calculatePayout } from "@/lib/money";
import { formatIst, timeUntil } from "@/lib/datetime";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Money } from "@/components/ui/Money";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/Modal";
import Link from "next/link";
import { ArrowLeft, Check, X, FileEdit, User, FileImage } from "lucide-react";

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState("overview");

  const { data: campaign, loading: campLoading, error: campError, execute: execCampaign } = useAsync(getCampaign);
  
  useEffect(() => {
    execCampaign(id);
  }, [id, execCampaign]);

  if (campLoading && !campaign) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-12 w-full max-w-sm mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (campError) {
    return <ErrorState title="Failed to load campaign" message={campError.message} onRetry={() => execCampaign(id)} />;
  }

  if (!campaign) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/brand/campaigns" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-sora text-2xl font-bold text-ink mb-2">{campaign.title}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <StatusPill status={campaign.status} />
              <span className="text-muted text-sm px-2 border-l border-line">
                Created on {formatIst(campaign.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SegmentedControl
          options={[
            { label: "Overview", value: "overview" },
            { label: "Applicants", value: "applicants" },
            { label: "Submissions", value: "submissions" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6">
        {tab === "overview" && <CampaignOverview campaign={campaign} />}
        {tab === "applicants" && <CampaignApplicants campaign={campaign} />}
        {tab === "submissions" && <CampaignSubmissions campaign={campaign} />}
      </div>
    </div>
  );
}

function CampaignOverview({ campaign }: { campaign: Campaign }) {
  const payout = calculatePayout(campaign.feePerCreatorPaise);
  
  const paidPct = Math.min(100, Math.floor(((campaign.paidPaise || 0) / campaign.budgetPaise) * 100));
  const reservedPct = Math.min(100, Math.floor(((campaign.reservedPaise || 0) / campaign.budgetPaise) * 100));
  const slotsPct = Math.min(100, Math.floor((campaign.approvedCount / campaign.slots) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <section>
          <h2 className="font-sora font-semibold text-xl text-ink mb-4">Description</h2>
          <div className="text-muted whitespace-pre-wrap">{campaign.description}</div>
        </section>

        <section>
          <h2 className="font-sora font-semibold text-xl text-ink mb-4">Requirements</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            {campaign.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-sora font-semibold text-lg text-ink mb-6">Campaign Status</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm text-muted mb-2 font-medium">
                <span>Slots filled</span>
                <span>{campaign.approvedCount} of {campaign.slots}</span>
              </div>
              <ProgressBar value={slotsPct} ariaLabel="Slots filled" />
            </div>

            <div>
              <div className="flex justify-between text-sm text-muted mb-2 font-medium">
                <span>Budget utilized</span>
                <span><Money paise={campaign.paidPaise || 0} /> of <Money paise={campaign.budgetPaise} /></span>
              </div>
              <ProgressBar value={paidPct} reserved={reservedPct} ariaLabel="Budget utilized" />
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Paid
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <div className="w-2 h-2 rounded-full bg-gold" /> Reserved
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-line">
              <div className="text-sm text-muted mb-1">Application deadline</div>
              <div className="font-medium text-ink">{formatIst(campaign.applicationDeadline)}</div>
              <div className="text-sm text-gold mt-1 font-medium">{timeUntil(campaign.applicationDeadline)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-sora font-semibold text-lg text-ink mb-4">Fee Structure (per creator)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Creator fee</span>
              <span><Money paise={payout.feePaise} /></span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Platform fee</span>
              <span><Money paise={payout.platformFeePaise} /></span>
            </div>
            <div className="flex justify-between text-muted">
              <span>GST</span>
              <span><Money paise={payout.gstPaise} /></span>
            </div>
            <div className="pt-3 border-t border-line flex justify-between font-semibold text-ink">
              <span>Total Cost</span>
              <span><Money paise={payout.brandCostPaise} /></span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CampaignApplicants({ campaign }: { campaign: Campaign }) {
  const { showToast } = useToast();
  const { data: apps, loading, error, execute } = useAsync(getCampaignApplications);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    execute(campaign._id);
  }, [campaign._id, execute]);

  const handleApprove = async (id: string) => {
    setActingOn(id);
    try {
      await approveApplication(id);
      showToast("Application approved");
      execute(campaign._id);
    } catch (err: unknown) {
      showToast((err as Error).message || "Approval failed");
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingOn(id);
    try {
      await rejectApplication(id);
      showToast("Application rejected");
      execute(campaign._id);
    } catch (err: unknown) {
      showToast((err as Error).message || "Rejection failed");
    } finally {
      setActingOn(null);
    }
  };

  if (loading && !apps) return <Skeleton className="h-64" />;
  if (error) return <ErrorState title="Failed to load applicants" message={error.message} onRetry={() => execute(campaign._id)} />;

  if (!apps || apps.length === 0) {
    return <EmptyState title="No applicants yet" description="When creators apply, they will appear here." icon={User} />;
  }

  const costPerSlot = calculatePayout(campaign.feePerCreatorPaise).brandCostPaise;

  return (
    <div className="space-y-4">
      {apps.map(app => {
        const creatorName = typeof app.creatorId === "object" ? app.creatorId.name : "Unknown Creator";
        
        return (
          <Card key={app._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-ink">{creatorName}</h4>
                <StatusPill status={app.status} />
              </div>
              <p className="text-sm text-muted">Applied {formatIst(app.appliedAt)}</p>
              {app.note && (
                <div className="mt-3 p-3 bg-soft rounded-lg text-sm text-ink italic">
                  &quot;{app.note}&quot;
                </div>
              )}
            </div>
            
            {app.status === "pending" && (
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="secondary" 
                  onClick={() => handleReject(app._id)}
                  disabled={actingOn === app._id}
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button 
                  onClick={() => handleApprove(app._id)}
                  disabled={actingOn === app._id}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve • reserve <Money paise={costPerSlot} className="ml-1 inline" />
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function CampaignSubmissions({ campaign }: { campaign: Campaign }) {
  const { showToast } = useToast();
  const { data: subs, loading, error, execute } = useAsync(getCampaignSubmissions);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    execute(campaign._id);
  }, [campaign._id, execute]);

  const handleApprove = async (id: string) => {
    setActingOn(id);
    try {
      await approveSubmission(id);
      showToast("Submission approved! Payout initiated.");
      execute(campaign._id);
    } catch (err: unknown) {
      showToast((err as Error).message || "Approval failed");
    } finally {
      setActingOn(null);
    }
  };

  const submitRevision = async () => {
    setActingOn(selectedSubId);
    try {
      await requestRevision(selectedSubId, feedback);
      showToast("Revision requested");
      setRevisionModalOpen(false);
      setFeedback("");
      execute(campaign._id);
    } catch (err: unknown) {
      showToast((err as Error).message || "Action failed");
    } finally {
      setActingOn(null);
    }
  };

  const submitReject = async () => {
    setActingOn(selectedSubId);
    try {
      await rejectSubmission(selectedSubId, feedback);
      showToast("Submission rejected");
      setRejectModalOpen(false);
      setFeedback("");
      execute(campaign._id);
    } catch (err: unknown) {
      showToast((err as Error).message || "Action failed");
    } finally {
      setActingOn(null);
    }
  };

  if (loading && !subs) return <Skeleton className="h-64" />;
  if (error) return <ErrorState title="Failed to load submissions" message={error.message} onRetry={() => execute(campaign._id)} />;

  if (!subs || subs.length === 0) {
    return <EmptyState title="No submissions yet" description="Approved creators haven't submitted their content yet." icon={FileImage} />;
  }

  const costPerSlot = calculatePayout(campaign.feePerCreatorPaise).brandCostPaise;

  return (
    <div className="space-y-4">
      {subs.map(sub => {
        const creatorName = typeof sub.creatorId === "object" ? sub.creatorId.name : "Unknown Creator";
        
        return (
          <Card key={sub._id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-ink">{creatorName}</h4>
                  <StatusPill status={sub.status} />
                </div>
                <p className="text-sm text-muted">Submitted on {formatIst(sub.submittedAt)}</p>
              </div>

              <div className="p-4 bg-soft rounded-lg">
                <p className="text-sm font-medium text-ink mb-2">Content URL</p>
                <a 
                  href={sub.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {sub.url}
                </a>
              </div>

              {sub.history && sub.history.length > 1 && (
                <div className="text-sm text-muted">
                  <span className="font-medium">Revisions:</span> {sub.history.length - 1}
                </div>
              )}
            </div>
            
            {sub.status === "submitted" && (
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                <Button 
                  onClick={() => handleApprove(sub._id)}
                  disabled={actingOn === sub._id}
                  className="w-full md:w-auto"
                >
                  <Check className="w-4 h-4 mr-1" /> Approve & Pay <Money paise={costPerSlot} className="ml-1 inline" />
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="flex-1 md:flex-none"
                    onClick={() => {
                      setSelectedSubId(sub._id);
                      setFeedback("");
                      setRevisionModalOpen(true);
                    }}
                    disabled={actingOn === sub._id}
                  >
                    <FileEdit className="w-4 h-4 mr-1" /> Revision
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 md:flex-none text-bad hover:bg-bad/10"
                    onClick={() => {
                      setSelectedSubId(sub._id);
                      setFeedback("");
                      setRejectModalOpen(true);
                    }}
                    disabled={actingOn === sub._id}
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <ConfirmDialog
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Revision"
        description="Ask the creator to make changes to their submission."
        confirmLabel="Request Revision"
        onConfirm={submitRevision}
      >
        <div className="mt-4">
          <label className="text-sm font-medium text-ink mb-1 block">Feedback</label>
          <textarea
            className="w-full min-h-[100px] p-3 bg-surface border border-line rounded-md text-ink placeholder:text-muted focus-ring resize-y"
            placeholder="Explain what needs to be changed..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Submission"
        description="Are you sure you want to reject this submission? This will release the reserved funds."
        confirmLabel="Reject"
        onConfirm={submitReject}
      >
        <div className="mt-4">
          <label className="text-sm font-medium text-ink mb-1 block">Reason (Optional)</label>
          <textarea
            className="w-full min-h-[100px] p-3 bg-surface border border-line rounded-md text-ink placeholder:text-muted focus-ring resize-y"
            placeholder="Why is this submission being rejected?"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
