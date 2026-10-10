import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import * as submissionController from "../controllers/submission.controller.js";
import * as submissionSchema from "../validators/submission.schema.js";

const router = Router();

// Creator routes
router.get(
  "/mine",
  requireAuth,
  requireRole("creator"),
  submissionController.getMySubmissions
);

// Brand routes
router.post(
  "/:id/approve",
  requireAuth,
  requireRole("brand"),
  validateObjectId,
  submissionController.approveSubmission
);

router.post(
  "/:id/request-revision",
  requireAuth,
  requireRole("brand"),
  validateObjectId,
  validate(submissionSchema.requestRevisionSchema),
  submissionController.requestRevision
);

router.post(
  "/:id/reject",
  requireAuth,
  requireRole("brand"),
  validateObjectId,
  validate(submissionSchema.rejectSubmissionSchema),
  submissionController.rejectSubmission
);

export default router;
