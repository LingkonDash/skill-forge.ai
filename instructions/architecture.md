# Architecture — SkillForge AI

## Purpose of This Document

This document defines the system-level architecture for SkillForge AI. It exists so that every implementation decision — which layer a piece of logic lives in, how data moves between systems, where AI reasoning happens — is already decided before code is written.

The agent implements against this document. It does not redesign the architecture, merge layers, or introduce new services/domains not defined here. If a task seems to require deviating from this architecture, stop and flag it instead of improvising.

---

## 1. System Overview

SkillForge AI is a single unified Next.js full-stack application. There is no separate backend server — Next.js API routes (Route Handlers) act as the backend, running alongside the frontend in one codebase, one process, one deployment.

```
┌────────────────────────────────────────────────┐      ┌───────────┐
│                Next.js App                       │      │           │
│  ┌──────────────┐        ┌────────────────────┐  │      │   Groq    │
│  │   Frontend    │ ───► │  API Route Handlers  │◄─┼──────┤   (LLM)   │
│  │ (App Router)  │ ◄─── │     (app/api/*)      │  │      │           │
│  └──────────────┘        └──────────┬───────────┘  │      └───────────┘
│                                       │              │
│                          ┌────────────▼───────────┐  │
│                          │  AI Orchestration Layer │  │
│                          │       (lib/ai/*)         │  │
│                          └────────────┬───────────┘  │
└───────────────────────────────────────┼──────────────┘
                                          ▼
                                    ┌───────────┐
                                    │  MongoDB   │
                                    │(Persistence)│
                                    └───────────┘
```

- **Frontend (Next.js App Router)** — renders UI, calls API routes via TanStack Query, renders streamed AI responses. Lives under `app/(public)` and `app/(protected)`.
- **API Route Handlers (`app/api/*`)** — owns all business logic, auth, permissions, and database access, running as Next.js server-side route handlers. The frontend never talks to MongoDB or Groq directly — only through these routes.
- **AI Orchestration Layer (`lib/ai/*`)** — a distinct, server-only module responsible for prompt construction, context assembly, and calling Groq. Business logic (permissions, persistence, validation) never lives inside this layer, and prompt/orchestration logic never leaks into route handlers.
- **MongoDB** — single source of truth for all persisted data (users, roadmaps, progress, reviews, conversations, messages), accessed only from server-side code (route handlers and service functions), never from client components.

This collapses the previous three-tier split into one deployable app, but the internal separation of concerns (UI vs. business logic vs. AI orchestration vs. persistence) stays exactly as strict as before — it's now enforced by folder boundaries and the server/client split within one Next.js app instead of by two separate servers.

---

## 2. Domain Boundaries

The application is split into the following domains. Each domain owns its own API routes, service functions, and (where relevant) frontend routes. The agent should not cross these boundaries when implementing a slice unless the task explicitly spans domains.

| Domain | Owns | Depends on |
|---|---|---|
| **auth** | Login, registration, sessions, Better Auth config | — |
| **roadmaps** | Roadmap CRUD, roadmap generation trigger | auth, ai-coach (roadmap-agent) |
| **progress** | Milestone completion, completion %, progress stats | roadmaps |
| **community** | Public roadmap explore/search/filter, reviews | roadmaps |
| **ai-coach** | Conversations, messages, context assembly, streaming chat | roadmaps, progress |
| **dashboard** | Aggregated read-only views across roadmaps/progress/conversations | roadmaps, progress, ai-coach |

Each domain's exact endpoints, schemas, and permission rules are defined in `api-contract.md`, `database-schema.md`, and `permissions.md` respectively — this document only defines the boundaries and relationships between them.

---

## 3. The Two AI Agents

SkillForge AI has exactly two AI agents. They are architecturally distinct and must not be merged into one prompt/module.

### Agent 1 — Roadmap Generator
- **Trigger:** user submits the "Create Roadmap" form.
- **Input:** career goal, current skills, experience level, weekly study hours, learning style.
- **Behavior:** one-shot generation. Builds a structured prompt, calls Groq, parses the returned markdown/structured roadmap, and hands it back to the roadmaps domain to persist.
- **No memory required** — each generation is stateless. Regeneration is a fresh call, not a continuation.

### Agent 2 — AI Career Coach
- **Trigger:** user sends a chat message.
- **Input:** the user's message, plus assembled context (current roadmap, completed topics, progress %, and prior conversation messages).
- **Behavior:** context is gathered by the route handler/service *before* the prompt is built — the AI never queries the database itself. The orchestration layer assembles context → builds prompt → streams response back to the client → persists the message pair.
- **Memory:** conversation history is read from MongoDB per request; the AI does not retain state between requests itself.

Full prompt templates and context-assembly logic are defined in `ai-pipeline.md`. This document only defines that these two agents exist, are separate, and where they sit in the request lifecycle.

---

## 4. Data Flow

### 4.1 Roadmap Generation Flow
```
User submits form (frontend component)
   → POST app/api/roadmaps/route.ts (roadmaps domain)
      → validate input (business logic)
      → lib/ai/roadmap-agent builds prompt, calls Groq
      → parse structured response
      → persist to MongoDB (Roadmaps collection)
   → return saved roadmap to frontend
   → frontend redirects to roadmap view
```

### 4.2 AI Coach Chat Flow (Streaming)
```
User sends message (frontend chat input)
   → POST app/api/chat/[conversationId]/messages/route.ts (ai-coach domain)
      → business logic: verify ownership, fetch roadmap + progress + prior messages
      → lib/ai/coach-agent assembles context, builds prompt
      → call Groq with streaming enabled
      → stream tokens back to frontend as they arrive (Next.js streaming Response)
      → once complete, persist both user message and AI response to MongoDB
   → frontend renders streamed tokens progressively with typing indicator
```

### 4.3 Progress Update Flow
```
User marks milestone complete (frontend)
   → PATCH app/api/progress/[roadmapId]/route.ts (progress domain)
      → business logic: recalculate completion %, update lastUpdated
      → persist to MongoDB (Progress collection)
   → return updated progress to frontend
   → dashboard/charts re-fetch via TanStack Query
```

---

## 5. Separation of AI Orchestration from Business Logic

This is a non-negotiable rule for every domain that touches AI:

- **Business logic** (auth checks, ownership checks, validation, persistence, progress calculation) lives in domain service functions (`lib/domains/<domain>/*.service.ts`), called from route handlers (`app/api/<domain>/*`).
- **AI orchestration** (prompt templates, context shaping, Groq calls, response parsing, streaming) lives only in `lib/ai/*`.
- A route handler or service function may *call* `lib/ai/*` functions, but `lib/ai/*` must never directly query the database, check permissions, or perform persistence. It receives already-fetched context as input and returns generated content as output.

This keeps AI logic swappable and testable in isolation, and keeps business rules enforceable regardless of what the AI returns.

---

## 6. Server/Client Boundary

Since frontend and backend now share one codebase, this boundary matters more than it did with two separate servers:

- `lib/ai/*`, `lib/db/*`, and all domain service functions are **server-only** — they must never be imported into a Client Component (`"use client"` files). Only route handlers, Server Components, and other server-only modules may import them.
- Environment variables for secrets (`GROQ_API_KEY`, `MONGODB_URI`, `BETTER_AUTH_SECRET`) are never prefixed `NEXT_PUBLIC_` and must never be referenced from client-side code.
- Frontend components talk to the backend the same way they would with a separate server: via `fetch` calls (wrapped in `lib/api/*` and TanStack Query hooks) to `app/api/*` routes — never by importing a service function directly into a component.

---

## 7. Cross-Domain Read Patterns

The **dashboard** domain and the **ai-coach** domain both need read access to data owned by other domains (roadmaps, progress). This is allowed **only as read-only service function calls**, never direct cross-domain database writes:

- `ai-coach` may *read* from `roadmaps` and `progress` to assemble context.
- `dashboard` may *read* from `roadmaps`, `progress`, and `ai-coach` to build aggregated views.
- No domain writes to another domain's collections directly.

---

## 8. What This Document Does Not Cover

- Exact endpoint shapes → `api-contract.md`
- Exact collection schemas → `database-schema.md`
- Folder/file layout → `folder-structure.md`
- Auth mechanics → `auth-rules.md`
- Ownership/access rules → `permissions.md`
- Prompt templates and context assembly detail → `ai-pipeline.md`
- Build order → `implementation-phases.md`