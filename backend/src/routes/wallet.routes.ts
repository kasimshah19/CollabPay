import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { withdrawalSchema } from "../validators/wallet.schema.js";
import * as walletController from "../controllers/wallet.controller.js";

const router = Router();

// Creator routes
router.get("/balance", requireAuth, requireRole("creator"), walletController.getWallet);
router.get("/ledger", requireAuth, requireRole("creator"), walletController.getLedger);
router.post("/withdraw", requireAuth, requireRole("creator"), validate(withdrawalSchema), walletController.requestWithdrawal);
router.get("/withdrawals", requireAuth, requireRole("creator"), walletController.getWithdrawals);

export default router;
