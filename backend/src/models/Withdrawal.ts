import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amountPaise: number;
  upiId: string;
  status: "processing" | "succeeded" | "failed";
  failureReason?: string;
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amountPaise: { type: Number, required: true, min: 10000 },
    upiId: { type: String, required: true, minlength: 3, maxlength: 100 },
    status: { type: String, enum: ["processing", "succeeded", "failed"], default: "processing" },
    failureReason: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

withdrawalSchema.index({ userId: 1, createdAt: -1 });

export const Withdrawal = mongoose.model<IWithdrawal>("Withdrawal", withdrawalSchema);
