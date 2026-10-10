import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import * as applicationController from "../controllers/application.controller.js";
import * as submissionController from "../controllers/submission.controller.js";
import { validate } from "../middleware/validate.js";
import { submitWorkSchema } from "../validators/submission.schema.js";

const applicationRouter = Router();

// Creator routes
applicationRouter.get("/mine", requireAuth, requireRole("creator"), applicationController.getMyApplications);
applicationRouter.post("/:id/withdraw", requireAuth, requireRole("creator"), validateObjectId("id"), applicationController.withdrawApplication);
applicationRouter.post("/:id/submit", requireAuth, requireRole("creator"), validateObjectId("id"), validate(submitWorkSchema), submissionController.submitWork);

// Brand routes
applicationRouter.post("/:id/approve", requireAuth, requireRole("brand"), validateObjectId("id"), applicationController.approveApplication);
applicationRouter.post("/:id/reject", requireAuth, requireRole("brand"), validateObjectId("id"), applicationController.rejectApplication);

export default applicationRouter;
