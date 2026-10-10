import { z } from "zod";

export const submitWorkSchema = z.object({
  instagramUrl: z.string().url()
});

export const requestRevisionSchema = z.object({
  note: z.string().min(1).max(500)
});

export const rejectSubmissionSchema = z.object({
  note: z.string().max(500).optional()
});
