# Auth Rules — SkillForge AI

## Purpose of This Document

This document defines authentication mechanics: how sessions are created, validated, and enforced across the app. The agent implements auth exactly as specified here — do not introduce alternate session mechanisms (e.g. custom JWT alongside Better Auth) or skip validation on any protected route.

Endpoint shapes are defined in `api-contract.md` §1; this document defines what happens *inside* those endpoints and how every other protected endpoint checks the result.

---

## 1. Auth Provider

- **Better Auth** is the single source of truth for sessions across the app, running entirely within the Next.js app — there is no separate auth server.
- Supported sign-in methods: **Email/Password**, **Google OAuth**, **Demo Login**.
- Better Auth's server-side configuration lives in `lib/domains/auth/auth.service.ts` and is mounted via the catch-all route handler at `app/api/auth/[...all]/route.ts` (per `folder-structure.md` §2). Its client-side counterpart (React hooks, session state) lives in `lib/auth/*`.
- Do not implement a parallel JWT scheme — Better Auth issues and validates its own session tokens; the app does not hand-roll token signing/verification.
- Do not hand-write individual route files for register/login/google/demo/logout/session — Better Auth's catch-all handler serves all of these internally at the paths listed in `api-contract.md` §1.

---

## 2. Email/Password Flow

1. **Register** (`POST /api/auth/register`, handled by the Better Auth catch-all): validate email uniqueness → hash password → create `User` document with `provider: "email"` → issue session via Better Auth.
2. **Login** (`POST /api/auth/login`): look up user by email → verify password hash → issue session.
3. Passwords are never returned in any response (`database-schema.md` §8) and never logged.

---

## 3. Google OAuth Flow

1. Frontend initiates Google sign-in via Better Auth's client SDK (`lib/auth/*`).
2. On successful OAuth callback (handled by the catch-all route), Better Auth provides profile data (name, email, image).
3. The auth service upserts a `User` document: if the email already exists with `provider: "email"`, do not silently merge accounts — return a `VALIDATION_ERROR` indicating the email is already registered with a different method. If no user exists, create one with `provider: "google"`.
4. Issue session via Better Auth on success.

---

## 4. Demo Login Flow

1. `POST /api/auth/demo` creates or reuses a single shared demo `User` document (`provider: "demo"`) and issues a session for it.
2. Demo accounts are read/write like any other account, but the frontend should visibly indicate "Demo Mode" so the user understands data may be shared or reset.
3. Demo login never requires credentials.

---

## 5. Session Validation

- Route protection is enforced via Next.js `middleware.ts` at the project root, which runs on every request matching the `(protected)` route group and the protected API routes.
- The middleware reads the Better Auth session cookie, validates it, and either allows the request through (attaching the resolved session to the request context for server components/route handlers to read) or redirects/rejects.
- Individual route handlers (`app/api/*/route.ts`) and Server Components never re-implement session parsing — they read the already-validated session (via Better Auth's server-side session helper, e.g. `auth.api.getSession(...)`) as trusted.
- For API routes specifically: a route handler that requires auth calls the shared session-check helper at the top of its function and returns `UNAUTHORIZED` immediately if no valid session is present — this is a normal function call now, not an Express middleware chain, but the enforcement point is the same: before any business logic runs.

---

## 6. Protected Routes

### Route Protection (single mechanism, frontend and backend both covered)
- `middleware.ts` protects both `(protected)` page routes (dashboard, roadmaps/create, roadmaps/manage, chat, profile) and their corresponding `app/api/*` routes in one place, since both are part of the same Next.js app.
- Unauthenticated users hitting a protected page route are redirected to `/login`.
- Unauthenticated requests to a protected API route return `UNAUTHORIZED` per the shared response envelope (`coding-guidelines.md` §2.1) — API routes redirect nowhere, they just reject.
- Ownership checks (e.g. "is this user the roadmap's owner") are a separate, additional layer defined in `permissions.md` — `middleware.ts` and the session-check helper only confirm *who* the user is, not *what* they're allowed to do.

### Frontend Session State
- Session state is read via Better Auth's client hooks (`lib/auth/*`); do not duplicate session logic in individual page components — use a shared session hook/provider.

---

## 7. Session Lifecycle

- Sessions persist via Better Auth's own session storage/cookie mechanism — no custom expiry logic should be implemented outside its defaults unless a later instruction specifies otherwise.
- `POST /api/auth/logout` invalidates the current session via Better Auth and clears the client-side session state.
- `GET /api/auth/session` is the single source of truth the frontend polls/reads on load to determine auth state — do not infer auth state from local component state alone.

---

## 8. Security Requirements

- All auth traffic runs over HTTPS in production (hosting-platform concern, not something to special-case in code).
- Passwords hashed via Better Auth's built-in hashing — never implement custom hashing.
- Rate limiting on `/api/auth/login` and `/api/auth/register` is out of scope for this phase unless a later instruction adds it.
- No CORS configuration is needed for auth (or any other API route) since frontend and backend are now the same origin, in the same Next.js app — this is a simplification from the previous two-server setup, not something to add back in.

---

## 9. What This Document Does Not Cover

- Who can access/modify specific resources once authenticated → `permissions.md`
- Endpoint request/response payload shapes → `api-contract.md`
- Frontend component structure for login/register pages → `ui-guidelines.md`
- Server/client import boundaries → `architecture.md` §6