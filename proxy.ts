/**
 * Next.js Proxy (previously middleware) — route protection shell.
 *
 * NOTE: In Next.js 16, the file convention was renamed from `middleware.ts`
 * to `proxy.ts` and the exported function from `middleware` to `proxy`.
 * Per implementation-phases.md §0 ("Create the root middleware.ts file"),
 * this file IS the middleware equivalent — the instruction docs pre-date
 * this Next.js 16 change. See: node_modules/next/dist/docs/.../proxy.md
 *
 * Phase 0: This is a minimal pass-through shell. Real session-checking
 * logic (protecting (protected) page routes and API routes via Better Auth)
 * is added in Phase 2 per auth-rules.md §5–6.
 *
 * The matcher is pre-scoped to the routes Phase 2 will protect so no
 * config change will be needed when the real logic is added.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest): NextResponse {
  // Phase 0: pass all requests through. Phase 2 adds auth checks here.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect (protected) page route groups and their API routes.
     * Excludes:
     *   - _next/static, _next/image (Next.js internals)
     *   - favicon.ico, public assets
     *   - /api/auth/* (Better Auth owns this catch-all)
     *   - /api/health (always public)
     *   - /api/community/*, /api/reviews/* (publicly readable)
     */
    "/(dashboard|roadmaps|chat|profile)(.*)",
    "/api/(roadmaps|progress|dashboard)(.*)",
    "/api/chat(.*)",
  ],
};
