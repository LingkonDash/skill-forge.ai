/**
 * Health-check route — GET /api/health
 *
 * Confirms the app is running and has a live MongoDB connection.
 * Returns the shared success envelope per coding-guidelines.md §2.1.
 */

import { connectToDatabase } from "@/lib/db/connection";
import { success, failure } from "@/lib/utils/response";
import mongoose from "mongoose";

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();

    // Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const dbState = mongoose.connection.readyState;
    const dbConnected = dbState === 1;

    if (!dbConnected) {
      return failure(
        `MongoDB not connected (readyState: ${dbState})`,
        "DB_UNAVAILABLE",
        503
      );
    }

    return success({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return failure(
      `Health check failed: ${String(err)}`,
      "HEALTH_CHECK_FAILED",
      503
    );
  }
}
