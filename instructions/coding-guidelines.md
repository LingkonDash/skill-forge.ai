# Coding Guidelines — SkillForge AI

## Purpose of This Document

This document defines code-level conventions across the app: TypeScript usage, error handling, naming, response shapes, and styling rules. The agent follows these on every file it touches — consistency across domains matters more than any individual file's cleverness.

---

## 1. TypeScript Conventions

- Keep types **simple and close to where they're used**. Prefer a type defined next to the function/component that uses it over a deeply nested shared type hierarchy.
- Shared types (request/response DTOs in `types/*`, used by both route handlers and frontend components) are the exception — those should match `api-contract.md` exactly, field for field.
- Avoid `any`. If a shape is genuinely dynamic (e.g. `generatedRoadmap`), define an explicit interface for it (see `database-schema.md` §2) rather than typing it loosely.
- Avoid advanced generic/utility-type gymnastics. Prefer explicit, readable interfaces over clever conditional types — this codebase favors clarity over type-level cleverness.
- Use `type` for unions/simple shapes, `interface` for object shapes that might be extended (e.g. domain models).

---

## 2. API Routes & Error Handling

### 2.1 Response Envelope

Every API response uses the shared envelope defined in `api-contract.md`:
```ts
// lib/utils/response.ts
export const success = (data: unknown) => ({ success: true, data });
export const failure = (message: string, code: string) => ({
  success: false,
  error: { message, code }
});
```
Route handlers always return through these helpers (wrapped in `NextResponse.json(...)`) — never a raw object shape.

### 2.2 Error Handling Pattern

- Domain-specific errors (`NotFoundError`, `ForbiddenError`, `ValidationError`, `AIGenerationError`) are thrown from service functions in `lib/domains/*`, not from route handlers directly.
- Since Next.js Route Handlers don't have an Express-style middleware chain, error handling is done via a shared wrapper function (e.g. `withErrorHandling(handler)` in `lib/utils/response.ts` or similar) that every route handler is wrapped in — it catches thrown domain errors, maps them to the correct HTTP status + error code (per `api-contract.md` §7), and returns via the `failure()` helper. Write this wrapper once and reuse it across every route handler; don't hand-write a try/catch per route.
- Route handlers stay thin: parse/validate request → call the domain service function → return `success(result)` via the wrapper. No business logic inside the route handler itself.

### 2.3 Validation

- Request body validation happens at the top of each route handler using a schema per route (zod or equivalent), before any service function is called.
- Never rely on service-layer checks alone to catch malformed input — validation is a distinct step, not folded into business logic.

### 2.4 Naming

- Files: `kebab-case` (`roadmaps.service.ts`).
- Route handler files: always `route.ts`, placed in the appropriate `app/api/*` folder per `folder-structure.md`.
- Functions/variables: `camelCase`.
- Types/interfaces: `PascalCase`.
- MongoDB model files: `<singular-name>.model.ts` (matches `folder-structure.md`).

---

## 3. Frontend Conventions

### 3.1 Styling

- **Tailwind only** — no inline `style={}` props and no separate CSS modules per component, except for the handful of cases defined in `ui-guidelines.md` (e.g. canvas/animation backgrounds).
- Use the color tokens defined in `ui-guidelines.md`, not raw hex values scattered across components.

### 3.2 Icons

- Use `react-icons` for all iconography — no inline SVGs for standard icons, no other icon libraries.

### 3.3 Animation

- Use **Framer Motion** for component transitions/entrances, with the standard easing curve `[0.22, 1, 0.36, 1]` for consistency across the app.
- Use **GSAP** only where Framer Motion isn't suited (e.g. complex scroll-triggered sequences on the landing page) — don't reach for GSAP for simple mount/unmount transitions Framer Motion already handles well.

### 3.4 Data Fetching

- All server communication goes through **TanStack Query** — no raw `useEffect` + `fetch` for data that TanStack Query should own.
- API calls are defined once per domain in `lib/api/*`, and wrapped in hooks in `lib/query/*` (e.g. `useRoadmaps`, `useProgress`, `useChat`). Components call the hooks, never `fetch`/`lib/api` directly.
- Mutations (create/update/delete) use `useMutation` with query invalidation on success — don't manually refetch via separate effects.

### 3.5 Component Structure

- Keep components focused — a page component composes smaller components from `components/<domain>/*`, rather than holding all markup inline.
- Shared primitives (buttons, inputs, cards) live in `components/ui/*` and are reused across domains, not redefined per feature.

---

## 4. Server/Client Boundary

- Files under `lib/ai/*` and `lib/db/*` are server-only — never imported into a `"use client"` component (per `architecture.md` §6). If a component needs data from these layers, it goes through an `app/api/*` route via a TanStack Query hook, not a direct import.
- Server Components (the default in the App Router) may import server-only modules directly when it's genuinely a server-rendering concern, but any interactive component needing hooks/state must be a Client Component and must fetch via the API layer, not via direct service/model imports.
- Secrets (`GROQ_API_KEY`, `MONGODB_URI`, `BETTER_AUTH_SECRET`) are never prefixed `NEXT_PUBLIC_` and never referenced in any Client Component.

---

## 5. Streaming (AI Coach)

- The frontend consumes the streaming `Response` from `POST /api/chat/[conversationId]/messages` (per `api-contract.md` §5) and appends tokens to the in-progress assistant message as they arrive — never wait for the full response before rendering anything.
- Show a typing indicator from the moment the request is sent until the first token arrives.

---

## 6. General Rules

- **No dead code / commented-out blocks** left behind — remove exploratory code before considering a task complete.
- **No new dependencies** beyond what's listed in `architecture.md`'s tech stack without flagging it first — don't silently add a new library to solve a problem the existing stack already handles.
- Keep functions single-purpose. If a service function is doing validation, DB access, and response shaping all at once, split it.
- Comments explain *why*, not *what* — avoid narrating obvious code line-by-line.

---

## 7. What This Document Does Not Cover

- Visual design tokens (colors, typography, spacing) → `ui-guidelines.md`
- Endpoint shapes → `api-contract.md`
- Domain/folder placement → `folder-structure.md`
- Prompt-specific code in `lib/ai/*` → `ai-pipeline.md`