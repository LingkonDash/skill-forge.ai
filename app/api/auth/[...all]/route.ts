import { auth } from "@/lib/domains/auth/auth.service";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
