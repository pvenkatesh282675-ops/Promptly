import mongoose, { Schema, Document } from "mongoose";

export interface IHistory extends Document {
  userId: string;
  prompt: string;
  response: string;
  metadata: {
    sources: { title: string; url: string }[];
    domains: string[];
    processingTime: number;
    highlights: string[];
  };
  createdAt: Date;
}

const HistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    metadata: {
      sources: [{ title: String, url: String }],
      domains: [String],
      processingTime: Number,
      highlights: [String],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IHistory>("History", HistorySchema);
