import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balancePaise: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balancePaise: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
