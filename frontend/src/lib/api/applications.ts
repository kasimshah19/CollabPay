import { fetchApi } from "../api";
import { Campaign } from "./campaigns";

export interface Application {
  _id: string;
  campaignId: string | Campaign;
  creatorId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  note?: string;
  rejectionReason?: string;
  appliedAt: string;
  decidedAt?: string;
}

export async function getCampaignApplications(campaignId: string, status?: string, page = 1, limit = 20): Promise<Application[]> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.append("status", status);
  return fetchApi(`/api/campaigns/${campaignId}/applications?${query.toString()}`);
}

export async function approveApplication(id: string): Promise<{ message: string; application: Application }> {
  return fetchApi(`/api/applications/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectApplication(id: string): Promise<{ message: string; application: Application }> {
  return fetchApi(`/api/applications/${id}/reject`, {
    method: "POST",
  });
}
