import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import * as walletService from "../services/wallet.service.js";
import * as withdrawalService from "../services/withdrawal.service.js";

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const wallet = await walletService.getWallet(userId);
    res.status(200).json(wallet);
  } catch (error) {
    next(error);
  }
};

export const getLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const entries = await walletService.getLedger(userId, page, limit);
    res.status(200).json(entries);
  } catch (error) {
    next(error);
  }
};

export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const result = await withdrawalService.requestWithdrawal(userId, req.body.amountPaise, req.body.upiId);
    res.status(202).json({ message: "Withdrawal processing", withdrawal: result });
  } catch (error) {
    next(error);
  }
};

export const getWithdrawals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!._id.toString());
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const withdrawals = await withdrawalService.getCreatorWithdrawals(userId, page, limit);
    res.status(200).json(withdrawals);
  } catch (error) {
    next(error);
  }
};
