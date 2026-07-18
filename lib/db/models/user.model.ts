import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: "email" | "google" | "demo";
  passwordHash?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  provider: { type: String, enum: ["email", "google", "demo"], required: true },
  passwordHash: {
    type: String,
    required: function () {
      return this.provider === "email";
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Remove passwordHash from API responses
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
