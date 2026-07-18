import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
  roadmapId: mongoose.Types.ObjectId;
  completedTopics: string[];
  completionPercentage: number;
  lastUpdated: Date;
}

const progressSchema = new Schema<IProgress>({
  roadmapId: {
    type: Schema.Types.ObjectId,
    ref: "Roadmap",
    required: true,
    unique: true,
  },
  completedTopics: { type: [String], default: [] },
  completionPercentage: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export const Progress: Model<IProgress> =
  mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", progressSchema);
