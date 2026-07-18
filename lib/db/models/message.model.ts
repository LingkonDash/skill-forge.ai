import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ conversationId: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
