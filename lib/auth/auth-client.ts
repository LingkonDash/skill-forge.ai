"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL can be omitted if it's the same origin
});

export const { useSession, signIn, signUp, signOut } = authClient;
