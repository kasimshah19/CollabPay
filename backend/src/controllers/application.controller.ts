import { Request, Response, NextFunction } from "express";
import * as applicationService from "../services/application.service.js";

export const applyToCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationService.applyToCampaign(req.params.id as any, req.user!._id, req.body.note);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const applications = await applicationService.getCreatorApplications(req.user!._id, page, limit);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationService.approveApplication(req.params.id as any, req.user!._id);
    res.json({ message: "Application approved", application });
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationService.rejectApplication(req.params.id as any, req.user!._id);
    res.json({ message: "Application rejected", application });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationService.withdrawApplication(req.params.id as any, req.user!._id);
    res.json({ message: "Application withdrawn", application });
  } catch (error) {
    next(error);
  }
};
