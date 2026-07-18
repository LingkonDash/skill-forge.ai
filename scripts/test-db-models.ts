// Env vars loaded via bash
import mongoose from "mongoose";
import { User } from "../lib/db/models/user.model";
import { Roadmap } from "../lib/db/models/roadmap.model";
import { Progress } from "../lib/db/models/progress.model";
import { Review } from "../lib/db/models/review.model";
import { Conversation } from "../lib/db/models/conversation.model";
import { Message } from "../lib/db/models/message.model";
import { connectToDatabase } from "../lib/db/connection";

async function runTest() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // Clean up first just in case
    await User.deleteMany({ email: "test@example.com" });

    // 1. User
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      provider: "email",
      passwordHash: "hashedpassword123",
    });
    await user.save();
    console.log("User saved successfully.");

    // Verify toJSON transform
    const userJSON = user.toJSON();
    if ("passwordHash" in userJSON) {
      throw new Error("passwordHash found in User JSON!");
    } else {
      console.log("Verified passwordHash is omitted from User toJSON");
    }

    // 2. Roadmap
    const roadmap = new Roadmap({
      userId: user._id,
      careerGoal: "Software Engineer",
      currentSkills: ["HTML", "CSS"],
      studyHours: 10,
      difficulty: "beginner",
      learningStyle: "mixed",
      generatedRoadmap: {
        weeks: [
          {
            weekNumber: 1,
            title: "Basics",
            topics: ["Variables"],
            resources: ["Link"],
            estimatedTime: "5h",
          },
        ],
        tips: ["Be consistent"],
      },
      estimatedDuration: "12 weeks",
      isPublic: true,
      tags: ["engineering"],
    });
    await roadmap.save();
    console.log("Roadmap saved successfully.");

    // 3. Progress
    const progress = new Progress({
      roadmapId: roadmap._id,
      completedTopics: ["Variables"],
      completionPercentage: 50,
    });
    await progress.save();
    console.log("Progress saved successfully.");

    // 4. Review
    const review = new Review({
      roadmapId: roadmap._id,
      userId: user._id,
      rating: 5,
      comment: "Great roadmap!",
    });
    await review.save();
    console.log("Review saved successfully.");

    // 5. Conversation
    const conversation = new Conversation({
      userId: user._id,
      roadmapId: roadmap._id,
    });
    await conversation.save();
    console.log("Conversation saved successfully.");

    // 6. Message
    const message = new Message({
      conversationId: conversation._id,
      role: "assistant",
      content: "Hello, how can I help you today?",
    });
    await message.save();
    console.log("Message saved successfully.");

    console.log("All tests passed successfully.");

    // Cleanup
    await Message.deleteOne({ _id: message._id });
    await Conversation.deleteOne({ _id: conversation._id });
    await Review.deleteOne({ _id: review._id });
    await Progress.deleteOne({ _id: progress._id });
    await Roadmap.deleteOne({ _id: roadmap._id });
    await User.deleteOne({ _id: user._id });
    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

runTest();
