import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'brand' | 'creator';
  notificationPrefs: {
    whatsapp: boolean;
    email: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return passwordHash in any response by default
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 60,
    },
    role: {
      type: String,
      enum: ['brand', 'creator'],
      required: true,
      immutable: true, // Immutable after creation
    },
    notificationPrefs: {
      whatsapp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
