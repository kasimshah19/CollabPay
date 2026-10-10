import mongoose from "mongoose";
import { Withdrawal } from "../models/Withdrawal.js";
import { Wallet } from "../models/Wallet.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { AppError } from "../middleware/AppError.js";
import { payoutProvider } from "./mockPayoutProvider.js";

export const MIN_WITHDRAWAL_PAISE = 10000;

export const requestWithdrawal = async (userId: mongoose.Types.ObjectId, amountPaise: number, upiId: string) => {
  if (amountPaise < MIN_WITHDRAWAL_PAISE) {
    throw new AppError(400, `Minimum withdrawal is Rs ${MIN_WITHDRAWAL_PAISE / 100}`, "INVALID_AMOUNT");
  }

  const session = await mongoose.startSession();
  let withdrawal;
  
  try {
    await session.withTransaction(async () => {
      // Deduct balance
      const wallet = await Wallet.findOneAndUpdate(
        { userId, balancePaise: { $gte: amountPaise } },
        { $inc: { balancePaise: -amountPaise } },
        { new: true, session }
      );

      if (!wallet) {
        throw new AppError(400, "Insufficient balance", "INSUFFICIENT_BALANCE");
      }

      // Create withdrawal
      withdrawal = new Withdrawal({
        userId,
        amountPaise,
        upiId,
        status: "processing"
      });
      await withdrawal.save({ session });

      // Ledger entry
      await LedgerEntry.create([{
        userId,
        type: "withdrawal_debit",
        amountPaise: -amountPaise,
        balanceAfterPaise: wallet.balancePaise,
        refType: "withdrawal",
        refId: withdrawal._id,
        description: `Withdrawal to ${upiId}`
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  // Trigger background process (do not await)
  processWithdrawal(withdrawal!._id as any).catch(console.error);

  return withdrawal!;
};

export const processWithdrawal = async (withdrawalId: mongoose.Types.ObjectId) => {
  const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, status: "processing" });
  if (!withdrawal) return; // Already processed or not processing

  const result = await payoutProvider.processPayout(withdrawal.amountPaise, withdrawal.upiId);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Atomic status transition
      const w = await Withdrawal.findOneAndUpdate(
        { _id: withdrawalId, status: "processing" },
        { 
          $set: { 
            status: result.success ? "succeeded" : "failed",
            failureReason: result.error,
            processedAt: new Date()
          } 
        },
        { new: true, session }
      );

      if (!w) return; // Processed concurrently

      if (!result.success) {
        // Reverse deduction
        const wallet = await Wallet.findOneAndUpdate(
          { userId: w.userId },
          { $inc: { balancePaise: w.amountPaise } },
          { new: true, session }
        );
        
        if (wallet) {
          await LedgerEntry.create([{
            userId: w.userId,
            type: "withdrawal_reversal",
            amountPaise: w.amountPaise,
            balanceAfterPaise: wallet.balancePaise,
            refType: "withdrawal",
            refId: w._id,
            description: `Withdrawal failed, refunding ${w.amountPaise} paise`
          }], { session });
        }
      }
    });
  } finally {
    await session.endSession();
  }
};

export const getCreatorWithdrawals = async (userId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
  return await Withdrawal.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};
