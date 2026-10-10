import { fetchApi } from "../api";

export interface PayoutPreview {
  feePaise: number;
  platformFeePaise: number;
  gstPaise: number;
  tdsPaise: number;
  creatorPayoutPaise: number;
  brandCostPaise: number;
}

export interface Campaign {
  _id: string;
  brandId: string;
  title: string;
  description: string;
  requirements: string[];
  budgetPaise: number;
  feePerCreatorPaise: number;
  slots: number;
  applicationDeadline: string;
  submissionDeadline: string;
  status: "open" | "cancelled" | "completed";
  reservedPaise: number;
  paidPaise: number;
  approvedCount: number;
  createdAt: string;
  updatedAt: string;
  // Computed fields from backend:
  availablePaise?: number;
  slotsLeft?: number;
  applicationsOpen?: boolean;
  payoutPreview?: PayoutPreview;
  applicationCounts?: {
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
  };
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  return fetchApi("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyCampaigns(page = 1, limit = 20): Promise<Campaign[]> {
  return fetchApi(`/api/campaigns?page=${page}&limit=${limit}`);
}

export async function getCampaign(id: string): Promise<Campaign> {
  return fetchApi(`/api/campaigns/${id}`);
}

export async function editCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  return fetchApi(`/api/campaigns/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function cancelCampaign(id: string): Promise<{ message: string; campaign: Campaign }> {
  return fetchApi(`/api/campaigns/${id}/cancel`, {
    method: "POST",
  });
}
