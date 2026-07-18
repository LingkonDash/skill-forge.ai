/**
 * MongoDB connection utility — server-only.
 *
 * Uses a cached connection promise to survive hot-reload in development
 * without leaking connections. A single global is safe here because
 * this module only ever runs on the server (route handlers / service
 * functions), never in a client bundle.
 *
 * Per architecture.md §6: import this only from server-side code.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Set it in .env.local or your environment."
  );
}

// Augment the NodeJS global to persist the cached connection across
// Next.js hot-reloads in development without a module-level variable reset.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cache = (global._mongooseCache ??= { conn: null, promise: null });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI as string, {
        // Prevent buffering commands before connection is ready.
        bufferCommands: false,
      })
      .then((mg) => {
        cache.conn = mg;
        return mg;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
