import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  userId: string;
  channelId: string;
  channelName?: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
}

const ChatSessionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  channelId: { type: String, required: true, index: true },
  channelName: { type: String },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  messageCount: { type: Number, default: 0 },
});

export default mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
