import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  budgetPaise: z.number().int().positive(),
  feePerCreatorPaise: z.number().int().positive(),
  slots: z.number().int().positive().max(1000),
  applicationDeadline: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
}).refine(data => data.budgetPaise >= data.feePerCreatorPaise, {
  message: "budgetPaise must be greater than or equal to feePerCreatorPaise",
  path: ["budgetPaise"],
}).refine(data => new Date(data.applicationDeadline) > new Date(), {
  message: "applicationDeadline must be in the future",
  path: ["applicationDeadline"],
}).refine(data => new Date(data.submissionDeadline) > new Date(data.applicationDeadline), {
  message: "submissionDeadline must be after applicationDeadline",
  path: ["submissionDeadline"],
});

export const editCampaignSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  budgetPaise: z.number().int().positive().optional(),
  feePerCreatorPaise: z.number().int().positive().optional(),
  slots: z.number().int().positive().max(1000).optional(),
  applicationDeadline: z.string().datetime().optional(),
  submissionDeadline: z.string().datetime().optional(),
}).refine(data => {
  if (data.budgetPaise !== undefined && data.feePerCreatorPaise !== undefined) {
    return data.budgetPaise >= data.feePerCreatorPaise;
  }
  return true;
}, {
  message: "budgetPaise must be greater than or equal to feePerCreatorPaise",
  path: ["budgetPaise"],
}).refine(data => {
  if (data.applicationDeadline && data.submissionDeadline) {
    return new Date(data.submissionDeadline) > new Date(data.applicationDeadline);
  }
  return true;
}, {
  message: "submissionDeadline must be after applicationDeadline",
  path: ["submissionDeadline"],
});
