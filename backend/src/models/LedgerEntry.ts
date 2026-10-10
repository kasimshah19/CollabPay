import mongoose, { Schema, Document } from "mongoose";
import { AppError } from "../middleware/AppError.js";

export interface ILedgerEntry extends Document {
  userId: mongoose.Types.ObjectId;
  type: "payout_credit" | "tds_deduction" | "withdrawal_debit" | "withdrawal_reversal";
  amountPaise: number;
  balanceAfterPaise: number;
  refType: "submission" | "withdrawal";
  refId: mongoose.Types.ObjectId;
  groupId?: string;
  description: string;
  createdAt: Date;
}

const ledgerEntrySchema = new Schema<ILedgerEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["payout_credit", "tds_deduction", "withdrawal_debit", "withdrawal_reversal"], 
      required: true 
    },
    amountPaise: { 
      type: Number, 
      required: true,
      validate: {
        validator: (v: number) => v !== 0,
        message: "Amount cannot be zero"
      }
    },
    balanceAfterPaise: { type: Number, required: true, min: 0 },
    refType: { type: String, enum: ["submission", "withdrawal"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    groupId: { type: String },
    description: { type: String, required: true },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ledgerEntrySchema.index({ refType: 1, refId: 1, type: 1 }, { unique: true });

// Enforce immutability
const preventMutation = function(next: any) {
  throw new AppError(500, "Ledger entries are immutable", "INVALID_STATE");
};

ledgerEntrySchema.pre("updateOne", preventMutation);
ledgerEntrySchema.pre("updateMany", preventMutation);
ledgerEntrySchema.pre("findOneAndUpdate", preventMutation);
ledgerEntrySchema.pre("replaceOne", preventMutation);
ledgerEntrySchema.pre("deleteOne", preventMutation);
ledgerEntrySchema.pre("deleteMany", preventMutation);
ledgerEntrySchema.pre("findOneAndDelete", preventMutation);

// Prevent saving after initial creation
ledgerEntrySchema.pre("save", function() {
  if (!this.isNew) {
    throw new AppError(500, "Ledger entries are immutable", "INVALID_STATE");
  }
});

export const LedgerEntry = mongoose.model<ILedgerEntry>("LedgerEntry", ledgerEntrySchema);
