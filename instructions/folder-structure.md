# Folder Structure — SkillForge AI

## Purpose of This Document

This document defines the exact repository layout. The agent creates files only inside the structure defined here. When an implementation task specifies "files allowed," those paths refer to the structure below — the agent must not create new top-level folders or restructure existing ones without an explicit instruction to do so.

---

## 1. Repository Layout

```
skillforge-ai/
├── app/                      # Next.js App Router — pages AND API routes
├── components/               # React components
├── lib/                      # Business logic, AI orchestration, DB, auth, utils
├── types/                    # Shared TypeScript types
├── public/
├── instructions/             # Spec/instruction md files (this folder)
├── package.json
├── tsconfig.json
└── README.md
```

One app, one `package.json`, one `tsconfig.json`. There is no separate backend package — API routes live inside the same Next.js app as the frontend.

---

## 2. `app/` — Pages and API Routes

```
app/
├── (public)/
│   ├── page.tsx                       # Home / landing
│   ├── explore/
│   │   ├── page.tsx                   # Explore roadmaps
│   │   └── [id]/page.tsx              # Roadmap details
│   ├── about/page.tsx
│   ├── blog/page.tsx
│   ├── contact/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (protected)/
│   ├── dashboard/page.tsx
│   ├── roadmaps/
│   │   ├── create/page.tsx
│   │   └── manage/page.tsx
│   ├── chat/
│   │   └── [conversationId]/page.tsx
│   └── profile/page.tsx
│
├── api/
│   ├── auth/
│   │   └── [...all]/route.ts          # Better Auth catch-all handler
│   ├── roadmaps/
│   │   ├── route.ts                   # POST (create), GET (list)
│   │   └── [id]/route.ts              # GET, PATCH, DELETE
│   ├── progress/
│   │   └── [roadmapId]/route.ts       # GET, PATCH
│   ├── community/
│   │   ├── roadmaps/route.ts          # GET (search/filter/sort/paginate)
│   │   └── roadmaps/[id]/related/route.ts
│   ├── reviews/
│   │   ├── [roadmapId]/route.ts       # GET, POST
│   │   └── [reviewId]/route.ts        # DELETE
│   ├── chat/
│   │   ├── [roadmapId]/conversation/route.ts   # GET (get-or-create)
│   │   └── [conversationId]/messages/route.ts  # GET, POST (streaming)
│   ├── dashboard/
│   │   └── route.ts                   # GET
│   └── contact/
│       └── route.ts                   # POST (only if built, per implementation-phases.md Phase 11)
│
├── layout.tsx
└── globals.css
```

**Notes:**
- Route Handlers (`route.ts`) are the direct replacement for what were previously Express routes + controllers. They parse/validate the request, call the relevant domain service function from `lib/domains/*`, and return a response using the shared envelope (`coding-guidelines.md` §2.1).
- `app/api/auth/[...all]/route.ts` is Better Auth's own catch-all handler — it internally handles `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/demo`, `/api/auth/logout`, `/api/auth/session` per the paths in `auth-rules.md` / `api-contract.md`. Do not hand-write separate route files for each auth action.

---

## 3. `components/`

```
components/
├── ui/                           # Shared primitives (button, card, input, etc.)
├── landing/                      # Hero, features, testimonials, FAQ, navbar, footer, etc.
├── explore/                      # Search bar, filters, roadmap cards, skeletons
├── dashboard/                    # Stat cards, progress chart, calendar widget
├── roadmap/                      # Roadmap form, roadmap view, milestone list, roadmap card
└── chat/                         # Chat input, message bubble, typing indicator
```

Unchanged in shape from the original plan — only the parent folder moved (no longer nested under `client/`).

---

## 4. `lib/`

```
lib/
├── domains/
│   ├── auth/
│   │   └── auth.service.ts             # Better Auth config/options object
│   │
│   ├── roadmaps/
│   │   └── roadmaps.service.ts         # validation, ownership checks, persistence
│   │
│   ├── progress/
│   │   └── progress.service.ts
│   │
│   ├── community/
│   │   ├── community.service.ts        # explore/search/filter
│   │   └── reviews.service.ts
│   │
│   ├── ai-coach/
│   │   └── chat.service.ts             # business logic: ownership, fetch context inputs
│   │
│   └── dashboard/
│       └── dashboard.service.ts        # read-only aggregation across domains
│
├── ai/                                  # SERVER-ONLY — see architecture.md §6
│   ├── roadmap-agent.ts                 # Agent 1: prompt build + Groq call + parse
│   ├── coach-agent.ts                   # Agent 2: prompt build + Groq streaming call
│   ├── groq-client.ts                   # Groq SDK wrapper
│   └── prompts/
│       ├── roadmap-prompt.ts
│       └── coach-prompt.ts
│
├── db/                                  # SERVER-ONLY
│   ├── connection.ts
│   └── models/
│       ├── user.model.ts
│       ├── roadmap.model.ts
│       ├── progress.model.ts
│       ├── review.model.ts
│       ├── conversation.model.ts
│       └── message.model.ts
│
├── auth/                                 # Better Auth CLIENT config, session hooks (used by frontend components)
│
├── api/                                  # Typed fetch wrappers per domain, called by TanStack Query hooks
├── query/                                # TanStack Query hooks (useRoadmaps, useProgress, useChat, etc.)
├── utils/                                # Shared formatting/validation helpers, response envelope, theme logic
└── middleware.ts                         # Route protection (replaces Express auth.middleware.ts — see below)
```

**Notes:**
- `lib/domains/*` is the direct replacement for what were previously Express controllers + services combined into one service layer per domain, called from the matching `app/api/*/route.ts`.
- `lib/ai/*` and `lib/db/*` are marked server-only and must never be imported into a `"use client"` component, per `architecture.md` §6.
- `lib/auth/*` is the **client-side** Better Auth config (React hooks, session state) — distinct from `lib/domains/auth/auth.service.ts`, which holds the **server-side** Better Auth configuration used by the route handler.
- Route protection for the `(protected)` route group is handled via Next.js `middleware.ts` at the project root (or `lib/middleware.ts` imported by it), checking the Better Auth session — this replaces the old Express `auth.middleware.ts`.

---

## 4.1 Why `lib/ai/*` Is Isolated

Per `architecture.md` §5, AI orchestration must stay separate from business logic. Concretely:

- `lib/domains/roadmaps/roadmaps.service.ts` calls `lib/ai/roadmap-agent.ts`, passing in already-validated input, and receives back a parsed roadmap object to persist. It never builds prompts itself.
- `lib/domains/ai-coach/chat.service.ts` fetches roadmap/progress/message-history data itself (business logic), then passes that context into `lib/ai/coach-agent.ts`, which only builds the prompt, calls Groq, and streams/returns the result.
- `lib/ai/*` files never import from `lib/db/models/*` directly — they receive data as function arguments.

---

## 5. `types/`

Shared TypeScript types/interfaces used by both route handlers and frontend components (request/response DTOs mirroring `api-contract.md`, matching `database-schema.md` shapes).

---

## 6. "Files Allowed" Convention

Every implementation task in `implementation-phases.md` specifies a `Files allowed:` list scoped to this structure. Example:

```
Implement: AI chat streaming

Files allowed:
- app/(protected)/chat/*
- app/api/chat/*
- components/chat/*
- lib/query/use-chat.ts
- lib/domains/ai-coach/*
- lib/ai/coach-agent.ts
- lib/ai/prompts/coach-prompt.ts
```

The agent must not touch files outside this list for a given task, even if it seems convenient (e.g. "quickly fixing" an unrelated component). If a task appears to require a file outside its allowed list, stop and flag it rather than expanding scope silently.

---

## 7. What This Document Does Not Cover

- Collection field definitions → `database-schema.md`
- Endpoint request/response shapes → `api-contract.md`
- Auth flow specifics → `auth-rules.md`
- Ownership/access rules → `permissions.md`
- Prompt content → `ai-pipeline.md`