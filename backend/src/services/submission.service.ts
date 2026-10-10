import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { Application } from "../models/Application.js";
import { Campaign } from "../models/Campaign.js";
import { Wallet } from "../models/Wallet.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { AppError } from "../middleware/AppError.js";
import { calculatePayout } from "../lib/money.js";
import { normalizeInstagramUrl } from "../lib/instagram.js";

export const submitWork = async (applicationId: mongoose.Types.ObjectId, creatorId: mongoose.Types.ObjectId, instagramUrl: string) => {
  const normalizedUrl = normalizeInstagramUrl(instagramUrl);
  
  const application = await Application.findOne({ _id: applicationId, creatorId });
  if (!application) throw new AppError(404, "Application not found", "NOT_FOUND");
  if (application.status !== "approved") throw new AppError(400, "Application must be approved to submit work", "INVALID_STATE");

  let submission = await Submission.findOne({ applicationId });

  if (!submission) {
    // First submission
    const campaign = await Campaign.findById(application.campaignId);
    if (!campaign) throw new AppError(404, "Campaign not found", "NOT_FOUND");
    
    // Check submission deadline (cancelled campaigns can still be submitted to)
    if (new Date() > new Date(campaign.submissionDeadline)) {
      throw new AppError(400, "Submission deadline has passed", "SUBMISSION_CLOSED");
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Guard application update to prevent double submissions
        const updatedApp = await Application.findOneAndUpdate(
          { _id: applicationId, submittedAt: null },
          { $set: { submittedAt: new Date() } },
          { new: true, session }
        );
        
        if (!updatedApp) {
          throw new AppError(400, "Work already submitted", "INVALID_STATE");
        }

        submission = new Submission({
          applicationId,
          campaignId: application.campaignId,
          creatorId,
          instagramUrl: normalizedUrl,
          status: "submitted",
          history: [{
            instagramUrl: normalizedUrl,
            submittedAt: new Date(),
            action: "submitted"
          }]
        });

        await submission.save({ session });
      });
    } catch (err: any) {
      if (err.code === 11000) throw new AppError(409, "This URL was already submitted to this campaign", "DUPLICATE_URL");
      throw err;
    } finally {
      await session.endSession();
    }
    
    return submission;
  } else {
    // Resubmission
    if (submission.status !== "revision_requested") {
      throw new AppError(400, "Can only resubmit when a revision is requested", "INVALID_STATE");
    }

    submission.history.push({
      instagramUrl: normalizedUrl,
      submittedAt: new Date(),
      action: "resubmitted"
    });
    submission.instagramUrl = normalizedUrl;
    submission.status = "submitted";

    try {
      await submission.save();
    } catch (err: any) {
      if (err.code === 11000) throw new AppError(409, "This URL was already submitted to this campaign", "DUPLICATE_URL");
      throw err;
    }
    return submission;
  }
};

export const approveSubmission = async (submissionId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();
  let result: any;
  try {
    await session.withTransaction(async () => {
      // Find submission (with lock implicitly via findOneAndUpdate atomic flip later, but we need to check ownership)
      const submission = await Submission.findById(submissionId).session(session);
      if (!submission || submission.status !== "submitted") {
        throw new AppError(400, "Submission not found or not in submitted state", "INVALID_STATE");
      }

      const campaign = await Campaign.findOne({ _id: submission.campaignId, brandId }).session(session);
      if (!campaign) throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");

      const application = await Application.findById(submission.applicationId).session(session);
      if (!application) throw new AppError(404, "Application not found", "NOT_FOUND");

      const now = new Date();
      
      // Calculate payout based on snapshotted reserved fee
      const payout = calculatePayout(application.reservedFeePaise || 0);

      // Atomic update submission
      const updatedSub = await Submission.findOneAndUpdate(
        { _id: submissionId, status: "submitted" },
        { 
          $set: { 
            status: "approved", 
            payout,
            decidedAt: now 
          },
          $push: {
            history: {
              instagramUrl: submission.instagramUrl,
              submittedAt: now,
              action: "approved"
            }
          }
        },
        { new: true, session }
      );

      if (!updatedSub) throw new AppError(400, "Submission state changed", "INVALID_STATE");

      // Update campaign budgets
      const updatedCampaign = await Campaign.findOneAndUpdate(
        { 
          _id: campaign._id,
          reservedPaise: { $gte: payout.feePaise } 
        },
        {
          $inc: {
            reservedPaise: -payout.feePaise,
            paidPaise: payout.feePaise,
            platformChargesPaise: payout.platformFeePaise + payout.gstPaise
          }
        },
        { new: true, session }
      );

      if (!updatedCampaign) throw new AppError(400, "Failed to update campaign budget (insufficient reserved paise)", "INVALID_STATE");

      // Update Wallet
      const walletUpdate = await Wallet.findOneAndUpdate(
        { userId: submission.creatorId },
        { $inc: { balancePaise: payout.creatorNetPaise } },
        { new: true, upsert: true, session }
      );

      const newBalance = walletUpdate.balancePaise;
      const groupId = new mongoose.Types.ObjectId().toHexString();

      // Insert Ledger Entries
      // Insert Ledger Entries one by one to avoid Mongoose array+session errors
      await LedgerEntry.create([{
        userId: submission.creatorId,
        type: "payout_credit",
        amountPaise: payout.feePaise,
        balanceAfterPaise: newBalance + payout.tdsPaise, // Before TDS deduction
        refType: "submission",
        refId: submissionId,
        groupId,
        description: `Payout credit for campaign ${campaign.title}`
      }], { session });

      await LedgerEntry.create([{
        userId: submission.creatorId,
        type: "tds_deduction",
        amountPaise: -payout.tdsPaise,
        balanceAfterPaise: newBalance,
        refType: "submission",
        refId: submissionId,
        groupId,
        description: `TDS deduction for campaign ${campaign.title}`
      }], { session });

      result = updatedSub;
    });
  } finally {
    await session.endSession();
  }
  return result;
};

export const requestRevision = async (submissionId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId, note: string) => {
  const submission = await Submission.findById(submissionId);
  if (!submission || submission.status !== "submitted") throw new AppError(400, "Submission not in submitted state", "INVALID_STATE");
  
  if (submission.revisionCount >= 2) throw new AppError(400, "Maximum revisions reached", "REVISION_LIMIT");

  const campaign = await Campaign.findOne({ _id: submission.campaignId, brandId });
  if (!campaign) throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");

  const updatedSub = await Submission.findOneAndUpdate(
    { _id: submissionId, status: "submitted" },
    {
      $set: { status: "revision_requested", brandFeedback: note, decidedAt: new Date() },
      $inc: { revisionCount: 1 },
      $push: {
        history: {
          instagramUrl: submission.instagramUrl,
          submittedAt: new Date(),
          action: "revision_requested",
          note
        }
      }
    },
    { new: true }
  );

  if (!updatedSub) throw new AppError(400, "Submission state changed", "INVALID_STATE");
  return updatedSub;
};

export const rejectSubmission = async (submissionId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId, note?: string) => {
  const session = await mongoose.startSession();
  let result: any;

  try {
    await session.withTransaction(async () => {
      const submission = await Submission.findById(submissionId).session(session);
      if (!submission || submission.status !== "submitted") throw new AppError(400, "Submission not in submitted state", "INVALID_STATE");

      const campaign = await Campaign.findOne({ _id: submission.campaignId, brandId }).session(session);
      if (!campaign) throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");

      const application = await Application.findById(submission.applicationId).session(session);
      if (!application) throw new AppError(404, "Application not found", "NOT_FOUND");

      const updatedSub = await Submission.findOneAndUpdate(
        { _id: submissionId, status: "submitted" },
        {
          $set: { status: "rejected", brandFeedback: note, decidedAt: new Date() },
          $push: {
            history: {
              instagramUrl: submission.instagramUrl,
              submittedAt: new Date(),
              action: "rejected",
              note
            }
          }
        },
        { new: true, session }
      );

      if (!updatedSub) throw new AppError(400, "Submission state changed", "INVALID_STATE");

      // Release reserved budget. Approved count is NOT decremented.
      await Campaign.findByIdAndUpdate(
        campaign._id,
        { $inc: { reservedPaise: -(application.reservedFeePaise || 0) } },
        { session }
      );

      result = updatedSub;
    });
  } finally {
    await session.endSession();
  }

  return result;
};

export const getCreatorSubmissions = async (creatorId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
  return await Submission.find({ creatorId })
    .populate("campaignId", "title status feePerCreatorPaise")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const getCampaignSubmissions = async (campaignId: mongoose.Types.ObjectId, brandId: mongoose.Types.ObjectId, statusFilter?: string, page: number = 1, limit: number = 20) => {
  const campaign = await Campaign.findOne({ _id: campaignId, brandId });
  if (!campaign) throw new AppError(403, "Not owner of this campaign", "NOT_OWNER");

  const filter: any = { campaignId };
  if (statusFilter) filter.status = statusFilter;

  return await Submission.find(filter)
    .populate("creatorId", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};
