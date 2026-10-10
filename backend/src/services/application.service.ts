import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Campaign } from "../models/Campaign.js";
import { AppError } from "../middleware/AppError.js";

export const applyToCampaign = async (campaignId: mongoose.Types.ObjectId, creatorId: mongoose.Types.ObjectId, note?: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new AppError(404, "Campaign not found", "NOT_FOUND");
  if (campaign.status !== "open") throw new AppError(400, "Campaign is not open", "APPLICATION_CLOSED");
  if (new Date() > new Date(campaign.applicationDeadline)) throw new AppError(400, "Application deadline has passed", "APPLICATION_CLOSED");
  if (campaign.slots <= campaign.approvedCount) throw new AppError(400, "Campaign is full", "CAMPAIGN_FULL"); // Require slotsLeft > 0

  try {
    const application = new Application({ campaignId, creatorId, note });
    await application.save();
    return application;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(409, "Already applied to this campaign", "ALREADY_APPLIED");
    }
    throw error;
  }
};

export const getCreatorApplications = async (creatorId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
  return await Application.find({ creatorId })
    .populate("campaignId", "title status feePerCreatorPaise")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const getCampaignApplicants = async (campaignId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId, statusFilter?: string, page: number = 1, limit: number = 20) => {
  const campaign = await Campaign.findOne({ _id: campaignId, brandId });
  if (!campaign) throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");

  const filter: any = { campaignId };
  if (statusFilter) filter.status = statusFilter;

  return await Application.find(filter)
    .populate("creatorId", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const approveApplication = async (applicationId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();
  let applicationResult;

  try {
    await session.withTransaction(async () => {
      // 1. Load application & check brand ownership implicitly by loading campaign
      const application = await Application.findById(applicationId).session(session);
      if (!application || application.status !== "pending") {
        throw new AppError(400, "Application not found or not pending", "INVALID_STATE");
      }

      const campaign = await Campaign.findOne({ _id: application.campaignId, brandId }).session(session);
      if (!campaign) {
        throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");
      }
      
      const now = new Date();
      if (campaign.status !== "open" || now > new Date(campaign.submissionDeadline)) {
        throw new AppError(400, "Campaign is closed or submission deadline passed", "INVALID_STATE");
      }

      // 2. Atomically update campaign with conditional filter
      const fee = campaign.feePerCreatorPaise;
      const updatedCampaign = await Campaign.findOneAndUpdate(
        {
          _id: campaign._id,
          status: "open",
          $expr: {
            $and: [
              { $lt: ["$approvedCount", "$slots"] },
              { $lte: [{ $add: ["$reservedPaise", "$paidPaise", fee] }, "$budgetPaise"] }
            ]
          }
        },
        {
          $inc: { approvedCount: 1, reservedPaise: fee }
        },
        { new: true, session }
      );

      if (!updatedCampaign) {
        // Find out why it failed
        const freshCampaign = await Campaign.findById(campaign._id).session(session);
        if (freshCampaign?.status !== "open") throw new AppError(400, "Campaign is not open", "INVALID_STATE");
        if (freshCampaign && freshCampaign.approvedCount >= freshCampaign.slots) throw new AppError(400, "Campaign is full", "CAMPAIGN_FULL");
        if (freshCampaign && freshCampaign.reservedPaise + (freshCampaign.paidPaise || 0) + fee > freshCampaign.budgetPaise) throw new AppError(400, "Budget exceeded", "BUDGET_EXCEEDED");
        throw new AppError(400, "Failed to reserve budget", "INVALID_STATE");
      }

      // 3. Atomically flip application status
      const updatedApp = await Application.findOneAndUpdate(
        { _id: applicationId, status: "pending" },
        { 
          $set: { 
            status: "approved", 
            reservedFeePaise: fee,
            approvedAt: now,
            decidedAt: now 
          } 
        },
        { new: true, session }
      );

      if (!updatedApp) {
        throw new AppError(400, "Application is no longer pending", "INVALID_STATE");
      }

      applicationResult = updatedApp;
    });
  } finally {
    await session.endSession();
  }

  return applicationResult;
};

export const rejectApplication = async (applicationId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId) => {
  const application = await Application.findById(applicationId);
  if (!application || application.status !== "pending") {
    throw new AppError(400, "Application not found or not pending", "INVALID_STATE");
  }

  const campaign = await Campaign.findOne({ _id: application.campaignId, brandId });
  if (!campaign) {
    throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");
  }

  const updatedApp = await Application.findOneAndUpdate(
    { _id: applicationId, status: "pending" },
    { $set: { status: "rejected", rejectionReason: "brand_rejected", decidedAt: new Date() } },
    { new: true }
  );

  if (!updatedApp) {
    throw new AppError(400, "Application is no longer pending", "INVALID_STATE");
  }

  return updatedApp;
};

export const withdrawApplication = async (applicationId: mongoose.Types.ObjectId, creatorId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const application = await Application.findOne({ _id: applicationId, creatorId }).session(session);
      if (!application) throw new AppError(404, "Application not found", "NOT_FOUND");
      
      if (application.status === "pending") {
        const updated = await Application.findOneAndUpdate(
          { _id: applicationId, status: "pending" },
          { $set: { status: "withdrawn", decidedAt: new Date() } },
          { new: true, session }
        );
        if (!updated) throw new AppError(400, "Application state changed", "INVALID_STATE");
        result = updated;
      } else if (application.status === "approved" && !application.submittedAt) {
        // Withdraw approved (but not submitted)
        const updated = await Application.findOneAndUpdate(
          { _id: applicationId, status: "approved", submittedAt: null },
          { $set: { status: "withdrawn", decidedAt: new Date() } },
          { new: true, session }
        );
        
        if (!updated) throw new AppError(400, "Cannot withdraw at this stage", "INVALID_STATE");
        
        // Release reservation
        await Campaign.findByIdAndUpdate(
          application.campaignId,
          { $inc: { approvedCount: -1, reservedPaise: -(application.reservedFeePaise || 0) } },
          { session }
        );
        
        result = updated;
      } else {
        throw new AppError(400, "Cannot withdraw application in current state", "INVALID_STATE");
      }
    });
  } finally {
    await session.endSession();
  }

  return result;
};
