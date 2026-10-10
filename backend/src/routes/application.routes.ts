import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import * as applicationController from "../controllers/application.controller.js";

const applicationRouter = Router();

// Creator routes
applicationRouter.get("/mine", requireAuth, requireRole("creator"), applicationController.getMyApplications);
applicationRouter.post("/:id/withdraw", requireAuth, requireRole("creator"), validateObjectId("id"), applicationController.withdrawApplication);

// Brand routes
applicationRouter.post("/:id/approve", requireAuth, requireRole("brand"), validateObjectId("id"), applicationController.approveApplication);
applicationRouter.post("/:id/reject", requireAuth, requireRole("brand"), validateObjectId("id"), applicationController.rejectApplication);

export default applicationRouter;
