import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
  createdAt: { type: Date, default: Date.now },
});

conversationSchema.index({ userId: 1, roadmapId: 1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", conversationSchema);
