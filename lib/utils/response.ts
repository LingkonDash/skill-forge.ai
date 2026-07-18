/**
 * Shared response envelope helpers — used by every Route Handler.
 * Per coding-guidelines.md §2.1 and api-contract.md.
 *
 * Route handlers always return through these helpers wrapped in
 * NextResponse.json(...) — never a raw object shape.
 */

import { NextResponse } from "next/server";

/** Success envelope: { success: true, data: <payload> } */
export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/** Error envelope: { success: false, error: { message, code } } */
export function failure(
  message: string,
  code: string,
  status = 400
): NextResponse {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

// ── Domain error classes ──────────────────────────────────────────────────
// Thrown from lib/domains/* service functions; caught by withErrorHandling.

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN";
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED";
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class AIGenerationError extends Error {
  readonly code = "AI_GENERATION_FAILED";
  constructor(message = "AI generation failed") {
    super(message);
    this.name = "AIGenerationError";
  }
}

// ── Route handler wrapper ─────────────────────────────────────────────────
// Wraps every route handler so domain errors map to correct HTTP statuses.
// Usage: export const GET = withErrorHandling(async (req) => { ... });

type Handler = (
  req: Request,
  ctx?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return failure(err.message, err.code, 404);
      }
      if (err instanceof ForbiddenError) {
        return failure(err.message, err.code, 403);
      }
      if (err instanceof UnauthorizedError) {
        return failure(err.message, err.code, 401);
      }
      if (err instanceof ValidationError) {
        return failure(err.message, err.code, 400);
      }
      if (err instanceof AIGenerationError) {
        return failure(err.message, err.code, 502);
      }
      // Unknown errors — don't leak internals
      const message =
        process.env.NODE_ENV === "development"
          ? String(err)
          : "Internal server error";
      return failure(message, "INTERNAL_ERROR", 500);
    }
  };
}
