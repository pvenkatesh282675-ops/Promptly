import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  name: string;
  password: string;
  avatar?: string;
  lastLogin: Date;
  metadata: {
    totalSessions: number;
    totalChannels: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    lastLogin: { type: Date, default: Date.now },
    metadata: {
      totalSessions: { type: Number, default: 0 },
      totalChannels: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
