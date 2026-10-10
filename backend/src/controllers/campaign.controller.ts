import { Request, Response, NextFunction } from "express";
import * as campaignService from "../services/campaign.service.js";
import * as applicationService from "../services/application.service.js";

export const createCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.createCampaign(req.user!._id, req.body);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

export const getMyCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const campaigns = await campaignService.getBrandCampaigns(req.user!._id, page, limit);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

export const getCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Note: To support both brand (owner) and creator (viewer), we might need different logic.
    // The prompt says: "GET /api/campaigns/:id — one campaign (brand owner view, includes counts of applications by status)"
    const campaign = await campaignService.getCampaignById(req.params.id as any, req.user!._id);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

export const editCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.editCampaign(req.params.id as any, req.user!._id, req.body);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

export const cancelCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.cancelCampaign(req.params.id as any, req.user!._id);
    res.json({ message: "Campaign cancelled", campaign });
  } catch (error) {
    next(error);
  }
};

export const getCampaignApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const statusFilter = req.query.status as string;
    
    const applicants = await applicationService.getCampaignApplicants(req.params.id as any, req.user!._id, statusFilter, page, limit);
    res.json(applicants);
  } catch (error) {
    next(error);
  }
};

export const getOpenCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const campaigns = await campaignService.getOpenCampaigns(page, limit);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};
