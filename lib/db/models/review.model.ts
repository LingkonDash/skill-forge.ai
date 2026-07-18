import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  roadmapId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  date: Date;
}

const reviewSchema = new Schema<IReview>({
  roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

reviewSchema.index({ roadmapId: 1 });
reviewSchema.index({ roadmapId: 1, userId: 1 }, { unique: true });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
