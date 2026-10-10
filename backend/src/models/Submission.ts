import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  applicationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  instagramUrl: string;
  status: "submitted" | "revision_requested" | "approved" | "rejected";
  revisionCount: number;
  brandFeedback?: string;
  history: Array<{
    instagramUrl: string;
    submittedAt: Date;
    action?: string;
    note?: string;
  }>;
  payout?: {
    feePaise: number;
    platformFeePaise: number;
    gstPaise: number;
    tdsPaise: number;
    creatorNetPaise: number;
    brandTotalPaise: number;
  };
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instagramUrl: { type: String, required: true },
    status: { type: String, enum: ["submitted", "revision_requested", "approved", "rejected"], default: "submitted" },
    revisionCount: { type: Number, default: 0, min: 0, max: 2 },
    brandFeedback: { type: String },
    history: [
      {
        instagramUrl: { type: String, required: true },
        submittedAt: { type: Date, required: true },
        action: { type: String },
        note: { type: String }
      }
    ],
    payout: {
      feePaise: { type: Number },
      platformFeePaise: { type: Number },
      gstPaise: { type: Number },
      tdsPaise: { type: Number },
      creatorNetPaise: { type: Number },
      brandTotalPaise: { type: Number }
    },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ campaignId: 1, instagramUrl: 1 }, { unique: true });
submissionSchema.index({ campaignId: 1, status: 1 });
submissionSchema.index({ creatorId: 1, createdAt: -1 });

export const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);
