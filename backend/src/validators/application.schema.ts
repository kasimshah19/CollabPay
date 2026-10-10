import { z } from "zod";

export const applySchema = z.object({
  note: z.string().max(500).optional(),
});
