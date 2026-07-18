import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectToDatabase } from "../../db/connection";

// Ensure we are connected to the database before creating the auth instance.
// Next.js App Router supports top-level await in Server Components / Route Handlers.
const mg = await connectToDatabase();
const db = mg.connection.getClient().db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    usePlural: true, // Matches Mongoose's pluralization (e.g., "users", "sessions")
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      provider: {
        type: "string",
        required: true,
        defaultValue: "email",
      },
      passwordHash: {
        type: "string",
        required: false,
      },
    },
  },
});
