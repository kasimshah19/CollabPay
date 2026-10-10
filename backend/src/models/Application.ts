import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  note?: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  reservedFeePaise?: number;
  approvedAt?: Date;
  decidedAt?: Date;
  rejectionReason?: "brand_rejected" | "campaign_cancelled";
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
    },
    reservedFeePaise: { type: Number },
    approvedAt: { type: Date },
    decidedAt: { type: Date },
    rejectionReason: { type: String, enum: ["brand_rejected", "campaign_cancelled"] },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applicationSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });
applicationSchema.index({ creatorId: 1, createdAt: -1 });
applicationSchema.index({ campaignId: 1, status: 1 });

export const Application = mongoose.model<IApplication>("Application", applicationSchema);
