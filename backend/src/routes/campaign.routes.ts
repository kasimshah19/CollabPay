import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { createCampaignSchema, editCampaignSchema } from "../validators/campaign.schema.js";
import * as campaignController from "../controllers/campaign.controller.js";
import * as submissionController from "../controllers/submission.controller.js";
import { applyToCampaign } from "../controllers/application.controller.js";
import { applySchema } from "../validators/application.schema.js";

const campaignRouter = Router();

// Creator routes
campaignRouter.get("/", requireAuth, requireRole("creator"), campaignController.getOpenCampaigns);
campaignRouter.post("/:id/apply", requireAuth, requireRole("creator"), validateObjectId("id"), validate(applySchema), applyToCampaign);

// Brand routes
campaignRouter.post("/", requireAuth, requireRole("brand"), validate(createCampaignSchema), campaignController.createCampaign);
campaignRouter.get("/mine", requireAuth, requireRole("brand"), campaignController.getMyCampaigns);
campaignRouter.get("/:id", requireAuth, requireRole("brand"), validateObjectId("id"), campaignController.getCampaign);
campaignRouter.patch("/:id", requireAuth, requireRole("brand"), validateObjectId("id"), validate(editCampaignSchema), campaignController.editCampaign);
campaignRouter.post("/:id/cancel", requireAuth, requireRole("brand"), validateObjectId("id"), campaignController.cancelCampaign);
campaignRouter.get("/:id/applications", requireAuth, requireRole("brand"), validateObjectId("id"), campaignController.getCampaignApplicants);
campaignRouter.get("/:id/submissions", requireAuth, requireRole("brand"), validateObjectId("id"), submissionController.getCampaignSubmissions);

export default campaignRouter;
