import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  brandId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  budgetPaise: number;
  feePerCreatorPaise: number;
  slots: number;
  applicationDeadline: Date;
  submissionDeadline: Date;
  status: "open" | "cancelled";
  approvedCount: number;
  reservedPaise: number;
  cancelledAt?: Date;
  paidPaise: number;
  platformChargesPaise: number;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    description: { type: String, maxlength: 2000 },
    budgetPaise: { type: Number, required: true, min: 0 },
    feePerCreatorPaise: { type: Number, required: true, min: 1 },
    slots: { type: Number, required: true, min: 1, max: 1000 },
    applicationDeadline: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    status: { type: String, enum: ["open", "cancelled"], default: "open" },
    approvedCount: { type: Number, default: 0, min: 0 },
    reservedPaise: { type: Number, default: 0, min: 0 },
    paidPaise: { type: Number, default: 0, min: 0 },
    platformChargesPaise: { type: Number, default: 0, min: 0 },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

campaignSchema.index({ brandId: 1, createdAt: -1 });
campaignSchema.index({ status: 1, applicationDeadline: 1 });

export const Campaign = mongoose.model<ICampaign>("Campaign", campaignSchema);
