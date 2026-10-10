import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import * as submissionService from "../services/submission.service.js";
import { AppError } from "../middleware/AppError.js";

// Brand endpoints
export const approveSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = new mongoose.Types.ObjectId(req.params.id as string);
    const brandId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const result = await submissionService.approveSubmission(submissionId, brandId);
    res.status(200).json({ message: "Submission approved successfully", submission: result });
  } catch (error) {
    next(error);
  }
};

export const requestRevision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = new mongoose.Types.ObjectId(req.params.id as string);
    const brandId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const result = await submissionService.requestRevision(submissionId, brandId, req.body.note);
    res.status(200).json({ message: "Revision requested", submission: result });
  } catch (error) {
    next(error);
  }
};

export const rejectSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = new mongoose.Types.ObjectId(req.params.id as string);
    const brandId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const result = await submissionService.rejectSubmission(submissionId, brandId, req.body.note);
    res.status(200).json({ message: "Submission rejected", submission: result });
  } catch (error) {
    next(error);
  }
};

export const getCampaignSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaignId = new mongoose.Types.ObjectId(req.params.id as string);
    const brandId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const submissions = await submissionService.getCampaignSubmissions(campaignId, brandId, status, page, limit);
    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};

// Creator endpoints
export const submitWork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicationId = new mongoose.Types.ObjectId(req.params.id as string);
    const creatorId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const result = await submissionService.submitWork(applicationId, creatorId, req.body.instagramUrl);
    res.status(201).json({ message: "Work submitted", submission: result });
  } catch (error) {
    next(error);
  }
};

export const getMySubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const submissions = await submissionService.getCreatorSubmissions(creatorId, page, limit);
    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};
