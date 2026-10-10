import mongoose from "mongoose";
import { Campaign } from "../models/Campaign.js";
import { Application } from "../models/Application.js";
import { AppError } from "../middleware/AppError.js";
import { calculatePayout } from "../lib/money.js";

export const createCampaign = async (brandId: mongoose.Types.ObjectId, data: any) => {
  const campaign = new Campaign({ ...data, brandId });
  await campaign.save();
  return campaign;
};

export const getBrandCampaigns = async (brandId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
  const campaigns = await Campaign.find({ brandId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const now = new Date();
  
  return campaigns.map(c => ({
    ...c,
    availablePaise: c.budgetPaise - c.reservedPaise - (c.paidPaise || 0),
    slotsLeft: c.slots - c.approvedCount,
    applicationsOpen: c.status === "open" && now < new Date(c.applicationDeadline),
    payoutPreview: calculatePayout(c.feePerCreatorPaise)
  }));
};

export const getCampaignById = async (id: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId) => {
  const campaign = await Campaign.findOne({ _id: id, brandId }).lean();
  if (!campaign) throw new AppError(404, "Campaign not found", "NOT_FOUND");

  const counts = await Application.aggregate([
    { $match: { campaignId: id } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const applicationCounts = counts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0, withdrawn: 0 });

  const now = new Date();
  return {
    ...campaign,
    availablePaise: campaign.budgetPaise - campaign.reservedPaise - (campaign.paidPaise || 0),
    slotsLeft: campaign.slots - campaign.approvedCount,
    applicationsOpen: campaign.status === "open" && now < new Date(campaign.applicationDeadline),
    payoutPreview: calculatePayout(campaign.feePerCreatorPaise),
    applicationCounts
  };
};

export const getOpenCampaigns = async (page: number = 1, limit: number = 20) => {
  const now = new Date();
  const campaigns = await Campaign.find({
    status: "open",
    applicationDeadline: { $gt: now },
    $expr: { $gt: ["$slots", "$approvedCount"] } // slotsLeft > 0
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return campaigns.map(c => ({
    ...c,
    availablePaise: c.budgetPaise - c.reservedPaise - (c.paidPaise || 0),
    slotsLeft: c.slots - c.approvedCount,
    applicationsOpen: true,
    payoutPreview: calculatePayout(c.feePerCreatorPaise)
  }));
};

export const editCampaign = async (id: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId, updates: any) => {
  const campaign = await Campaign.findOne({ _id: id, brandId });
  if (!campaign) throw new AppError(404, "Campaign not found", "NOT_FOUND");
  if (campaign.status !== "open") throw new AppError(400, "Cannot edit a cancelled campaign", "INVALID_STATE");

  const filter: any = { _id: id, brandId, status: "open" };
  const exprConditions: any[] = [];

  if (updates.slots !== undefined) {
    exprConditions.push({ $lte: ["$approvedCount", updates.slots] });
  }
  if (updates.budgetPaise !== undefined) {
    exprConditions.push({ $lte: [{ $add: ["$reservedPaise", "$paidPaise"] }, updates.budgetPaise] });
  }
  if (updates.feePerCreatorPaise !== undefined && updates.feePerCreatorPaise !== campaign.feePerCreatorPaise) {
    exprConditions.push({ $eq: ["$approvedCount", 0] });
  }

  if (exprConditions.length > 0) {
    filter.$expr = { $and: exprConditions };
  }

  const updatedCampaign = await Campaign.findOneAndUpdate(filter, { $set: updates }, { new: true });
  if (!updatedCampaign) {
    throw new AppError(400, "Edit conditions not met (e.g., trying to lower slots below approved count or edit fee after approvals)", "INVALID_STATE");
  }
  return updatedCampaign;
};

export const cancelCampaign = async (id: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();
  let result;
  
  try {
    await session.withTransaction(async () => {
      const campaign = await Campaign.findOneAndUpdate(
        { _id: id, brandId, status: "open" },
        { $set: { status: "cancelled", cancelledAt: new Date() } },
        { new: true, session }
      );
      
      if (!campaign) {
        throw new AppError(400, "Campaign not found or already cancelled", "INVALID_STATE");
      }

      await Application.updateMany(
        { campaignId: id, status: "pending" },
        { $set: { status: "rejected", rejectionReason: "campaign_cancelled", decidedAt: new Date() } },
        { session }
      );
      
      result = campaign;
    });
  } finally {
    await session.endSession();
  }
  
  return result;
};
