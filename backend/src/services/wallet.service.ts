import mongoose from "mongoose";
import { Wallet } from "../models/Wallet.js";
import { LedgerEntry } from "../models/LedgerEntry.js";

export const getWallet = async (userId: mongoose.Types.ObjectId) => {
  const wallet = await Wallet.findOne({ userId }).lean();
  return { balancePaise: wallet ? wallet.balancePaise : 0 };
};

export const getLedger = async (userId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
  return await LedgerEntry.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};
