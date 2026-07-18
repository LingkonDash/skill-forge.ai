import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  careerGoal: string;
  currentSkills: string[];
  studyHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  learningStyle: "video" | "reading" | "practice" | "mixed";
  generatedRoadmap: {
    weeks: Array<{
      weekNumber: number;
      title: string;
      topics: string[];
      resources: string[];
      project?: string;
      estimatedTime: string;
    }>;
    tips: string[];
  };
  estimatedDuration: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmap>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  careerGoal: { type: String, required: true },
  currentSkills: { type: [String], required: true },
  studyHours: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  learningStyle: {
    type: String,
    enum: ["video", "reading", "practice", "mixed"],
    required: true,
  },
  generatedRoadmap: { type: Schema.Types.Mixed, required: true },
  estimatedDuration: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

roadmapSchema.index({ userId: 1 });
roadmapSchema.index({ isPublic: 1, careerGoal: 1 });

export const Roadmap: Model<IRoadmap> =
  mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", roadmapSchema);
