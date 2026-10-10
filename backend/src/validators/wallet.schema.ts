import { z } from "zod";
import { MIN_WITHDRAWAL_PAISE } from "../services/withdrawal.service.js";

export const withdrawalSchema = z.object({
  amountPaise: z.number().int().min(MIN_WITHDRAWAL_PAISE),
  upiId: z.string().min(3).max(100)
});
