import { fetchApi } from "../api";
import { Campaign } from "./campaigns";

export interface SubmissionHistory {
  url: string;
  submittedAt: string;
}

export interface Submission {
  _id: string;
  campaignId: string | Campaign;
  creatorId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  status: "submitted" | "revision_requested" | "approved" | "rejected";
  url: string;
  revisionsRequested: number;
  history: SubmissionHistory[];
  feedback?: string;
  payoutSnapshot?: {
    feePaise: number;
    platformFeePaise: number;
    gstPaise: number;
    tdsPaise: number;
    creatorPayoutPaise: number;
    brandCostPaise: number;
  };
  submittedAt: string;
  updatedAt: string;
}

export async function getCampaignSubmissions(campaignId: string, status?: string, page = 1, limit = 20): Promise<Submission[]> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.append("status", status);
  return fetchApi(`/api/campaigns/${campaignId}/submissions?${query.toString()}`);
}

export async function approveSubmission(id: string): Promise<{ message: string; submission: Submission }> {
  return fetchApi(`/api/submissions/${id}/approve`, {
    method: "POST",
  });
}

export async function requestRevision(id: string, feedback: string): Promise<{ message: string; submission: Submission }> {
  return fetchApi(`/api/submissions/${id}/request-revision`, {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}

export async function rejectSubmission(id: string, feedback?: string): Promise<{ message: string; submission: Submission }> {
  return fetchApi(`/api/submissions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}
