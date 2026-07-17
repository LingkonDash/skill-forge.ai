# Implementation Phases — SkillForge AI

## How to Use This Document

This is the execution plan. Each phase is a self-contained vertical slice: a phase is not "done" until its Definition of Done checklist is fully satisfied, not just "the code exists." Work through phases in order — later phases depend on earlier ones being genuinely complete, not partially stubbed.

For every phase:
- Build only within the listed **Files Allowed**.
- Follow the referenced spec docs exactly — do not improvise schema fields, endpoint shapes, permission rules, or color values not already defined there.
- Do not start work described as "Out of Scope" for a phase, even if it seems convenient to bundle in — it belongs to a later phase for a reason (usually because something it depends on isn't built yet).
- At the end of a phase, verify every Definition of Done item yourself before considering the phase complete.

Act as a senior engineer executing a spec, not as a decision-maker on architecture — if something in a phase seems to require a decision not covered by the instruction docs, stop and flag it rather than choosing silently.

---

## Phase 0 — Project Scaffolding & Environment

**Objective:** Get the single Next.js app running, connected to MongoDB, and empty-but-functional before any feature work begins.

**Build:**
- Confirm the Next.js app (App Router, TypeScript, Tailwind) is initialized at the project root per `folder-structure.md`.
- Set up MongoDB connection (`lib/db/connection.ts`) with environment-based connection string.
- Create empty domain folders and model files per `folder-structure.md` (files can be empty/minimal shells at this point — just the structure).
- Set up a health-check route (`app/api/health/route.ts`) to confirm the app boots and connects to MongoDB.
- Set up Tailwind config with the CSS variable color mapping from `ui-guidelines.md` §1.3, even though no themed UI exists yet.
- Set up base layout (`app/layout.tsx`) with the theme provider (light/dark, `data-theme`) from `ui-guidelines.md` §2, defaulting correctly even with no visible UI yet.
- Set up shared response helpers (`success`/`failure`) per `coding-guidelines.md` §2.1.
- Create the root `middleware.ts` file (can be a minimal pass-through at this stage — real session logic gets added in Phase 2).

**Files Allowed:**
```
app/layout.tsx
app/api/health/route.ts
lib/utils/theme.ts
lib/utils/response.ts
lib/db/connection.ts
lib/db/models/*
middleware.ts
tailwind.config.*
```

**Definition of Done:**
- [ ] The app runs locally and renders a blank page with no console errors.
- [ ] `GET /api/health` returns a success envelope and confirms a live MongoDB connection.
- [ ] Toggling `data-theme` manually in devtools visibly changes background/text color (proves the CSS variables are wired, even with no components yet).
- [ ] Empty domain folders exist matching `folder-structure.md` exactly.

---

## Phase 1 — Database Models

**Objective:** All six collections exist as real, validated Mongoose models.

**Build:**
- Implement all models from `database-schema.md` §1–6 exactly: field types, required flags, enums, defaults, indexes.
- Add the `toJSON` transform on the User model to strip `passwordHash` from every response (`database-schema.md` §8).
- No routes/services yet — this phase is models only.

**Files Allowed:**
```
lib/db/models/*
```

**Definition of Done:**
- [ ] All six models exist with every field from `database-schema.md`.
- [ ] Indexes defined match `database-schema.md` (unique email, unique roadmapId on Progress, compound unique on Reviews, etc.).
- [ ] A quick manual insert/query test (script or REPL) confirms each model saves and validates correctly.
- [ ] `passwordHash` is confirmed absent from a serialized User object.

---

## Phase 2 — Authentication

**Objective:** A user can register, log in (email, Google, demo), and hit a protected route successfully; an unauthenticated user is correctly blocked.

**Build:**
- Configure Better Auth server-side per `auth-rules.md` §1, with the three sign-in methods, wired into `app/api/auth/[...all]/route.ts`.
- Configure Better Auth's client SDK in `lib/auth/*` — session hooks, sign-in/sign-up/sign-out calls.
- Implement the real `middleware.ts` per `auth-rules.md` §5–6: protects `(protected)` page routes (redirect to `/login`) and protected API routes (return `UNAUTHORIZED`).
- Frontend: login page, register page, a shared session hook/provider.
- Frontend: theme toggle control now gets placed in a minimal navbar (full navbar polish happens in Phase 3, but auth pages need *some* shell to sit in).

**Files Allowed:**
```
app/(public)/login/page.tsx
app/(public)/register/page.tsx
app/(protected)/*
app/api/auth/[...all]/route.ts
lib/auth/*
lib/domains/auth/auth.service.ts
middleware.ts
```

**Definition of Done:**
- [ ] Can register a new email account and land in a protected page.
- [ ] Can log out and get redirected away from a protected page.
- [ ] Can log back in with the same email account.
- [ ] Demo login works with zero input.
- [ ] Google login works end-to-end (or is clearly flagged if OAuth credentials aren't available yet in this environment).
- [ ] Hitting a protected API route without a session returns `UNAUTHORIZED`.
- [ ] Registering an email that already exists via Google returns the correct `VALIDATION_ERROR` per `auth-rules.md` §3.

---

## Phase 3 — Core Design System & Layout

**Objective:** The reusable component library and site shell exist, themed and working in both light and dark mode, before any feature page is built on top of them.

**Build:**
- Build `components/ui/*` primitives: Button, Input, Select, Card, Badge, Modal, Skeleton — per `ui-guidelines.md` §5, using the token-mapped Tailwind classes from §1.3.
- Build the full navbar (public + protected variants) and footer, including the working theme toggle per `ui-guidelines.md` §2.
- Set up base typography scale per `ui-guidelines.md` §3 (fonts loaded, type scale defined as reusable classes/utilities).

**Files Allowed:**
```
components/ui/*
components/landing/navbar.tsx
components/landing/footer.tsx
app/globals.css
lib/utils/theme.ts
```

**Definition of Done:**
- [ ] Every primitive component renders correctly in both light and dark mode with no hardcoded colors.
- [ ] Navbar shows correct links for logged-out vs logged-in state and includes a working theme toggle.
- [ ] Theme preference persists across a page refresh.
- [ ] No component in this phase uses a raw Tailwind default color class (spot check a few files).

---

## Phase 4 — Landing Page

**Objective:** The full public marketing homepage is live and responsive.

**Build:**
- Build all landing sections per the original spec: Hero, Features, Popular Career Paths, Community Statistics, Testimonials, FAQ, Newsletter, Call To Action — composed from `components/landing/*`, using the design system from Phase 3.
- Hero should be the palette's signature moment per `ui-guidelines.md` §4 — the path/milestone visual concept.
- Static/placeholder content is acceptable here (e.g. testimonials, stats) since no backend data source is defined for these sections.

**Files Allowed:**
```
app/(public)/page.tsx
components/landing/*
```

**Definition of Done:**
- [ ] All 8 sections present and responsive at mobile/tablet/desktop breakpoints.
- [ ] Hero renders correctly in both themes.
- [ ] No layout shift/overflow issues on small screens (spot check at 375px width).

---

## Phase 5 — Roadmap Creation (Vertical Slice: Form → AI → Persistence)

**Objective:** A logged-in user can fill out the roadmap form and get back a real, AI-generated, saved roadmap.

**Build:**
- Frontend: roadmap creation form (career goal, current skills, experience level, weekly hours, learning style) per the Core Features spec, using design-system components.
- Backend: `app/api/roadmaps/route.ts` (`POST`) per `api-contract.md` §2 — validation, then call into the AI layer.
- AI: `lib/ai/roadmap-agent.ts` + `lib/ai/prompts/roadmap-prompt.ts` + `lib/ai/groq-client.ts` per `ai-pipeline.md` §1–2, wired to the real Groq API.
- Business logic (`lib/domains/roadmaps/roadmaps.service.ts`): validates input, calls the AI agent, persists the result to the Roadmap model from Phase 1.
- Frontend: on success, redirect to a basic roadmap view page rendering the generated weeks/tips (full roadmap management UI comes in Phase 6 — this phase just needs to prove the slice works end-to-end).

**Files Allowed:**
```
app/(protected)/roadmaps/create/page.tsx
app/api/roadmaps/route.ts
components/roadmap/roadmap-form.tsx
components/roadmap/roadmap-view.tsx
lib/api/roadmaps.ts
lib/query/use-roadmaps.ts
lib/domains/roadmaps/roadmaps.service.ts
lib/ai/groq-client.ts
lib/ai/roadmap-agent.ts
lib/ai/prompts/roadmap-prompt.ts
```

**Definition of Done:**
- [ ] Submitting the form with real input returns a real Groq-generated roadmap, not placeholder data.
- [ ] The generated roadmap is persisted and matches the `generatedRoadmap` shape in `database-schema.md` §2.
- [ ] A malformed/unparseable AI response correctly surfaces `AI_GENERATION_FAILED` rather than crashing or silently saving broken data.
- [ ] The saved roadmap is visible on a basic view page after creation.
- [ ] `lib/ai/*` files are confirmed to not be imported from any `"use client"` component (spot check imports).

---

## Phase 6 — Roadmap Management

**Objective:** Full CRUD on roadmaps, from the user's own list.

**Build:**
- `app/api/roadmaps/route.ts` (`GET` — list) and `app/api/roadmaps/[id]/route.ts` (`GET`, `PATCH`, `DELETE`) per `api-contract.md` §2, enforcing ownership per `permissions.md` §1.
- Frontend: "Manage Roadmaps" page (list with edit/delete/regenerate actions), polished roadmap view page (replacing the basic one from Phase 5), regenerate action wired to the same AI agent.
- Cascade delete (Progress + Conversations + Messages) per `permissions.md` §7 — even though Progress/Conversations don't have their own UI yet, the delete logic must already handle them correctly since their models exist from Phase 1.

**Files Allowed:**
```
app/(protected)/roadmaps/manage/page.tsx
app/api/roadmaps/route.ts
app/api/roadmaps/[id]/route.ts
components/roadmap/*
lib/api/roadmaps.ts
lib/query/use-roadmaps.ts
lib/domains/roadmaps/roadmaps.service.ts
```

**Definition of Done:**
- [ ] A user sees only their own roadmaps on the manage page.
- [ ] Edit (`isPublic`, `tags`) and delete both work and reflect immediately without a manual refresh (query invalidation working).
- [ ] Regenerate produces a new roadmap and fully overwrites the old one (not merged).
- [ ] Deleting a roadmap also removes its Progress/Conversation/Message documents (verify directly in MongoDB).
- [ ] A non-owner attempting to edit/delete another user's roadmap via the API gets `FORBIDDEN`.

---

## Phase 7 — Progress Tracking

**Objective:** Users can mark topics complete and see accurate progress visualized.

**Build:**
- `app/api/progress/[roadmapId]/route.ts` (`GET`, `PATCH`) per `api-contract.md` §3, with server-side `completionPercentage` calculation per `database-schema.md` §8.
- A Progress document is created automatically the first time a roadmap is created (in Phase 5's create flow, or lazily on first progress fetch — pick one and apply consistently) so this phase doesn't need to backfill missing documents by hand.
- Frontend: milestone checklist UI on the roadmap view page, a progress bar/chart component (Recharts) reused later on the dashboard.

**Files Allowed:**
```
components/roadmap/milestone-list.tsx
components/dashboard/progress-chart.tsx
app/api/progress/[roadmapId]/route.ts
lib/api/progress.ts
lib/query/use-progress.ts
lib/domains/progress/progress.service.ts
```

**Definition of Done:**
- [ ] Marking a topic complete updates `completionPercentage` correctly (verify the math against `completedTopics.length / total topics`).
- [ ] Progress is scoped correctly — only the roadmap owner can view/update it, per `permissions.md` §2.
- [ ] The progress chart component renders correctly with 0%, partial, and 100% completion states.

---

## Phase 8 — Community: Explore & Reviews

**Objective:** Public roadmap discovery and the review system are live.

**Build:**
- `app/api/community/roadmaps/route.ts` (search/filter/sort/paginate), `app/api/community/roadmaps/[id]/related/route.ts` per `api-contract.md` §4, filtering at the DB level for `isPublic: true` per `permissions.md` §5.
- `app/api/reviews/[roadmapId]/route.ts` (`GET`, `POST`), `app/api/reviews/[reviewId]/route.ts` (`DELETE`) per `api-contract.md` §4 and `permissions.md` §3 (no self-review, one review per user per roadmap).
- Frontend: Explore page (search bar, filters, sort, pagination, responsive card grid, skeleton loaders reusing the roadmap card from Phase 6), Roadmap Details page (public view — description, career info, modules, reviews list, related roadmaps, review submission form for logged-in users).

**Files Allowed:**
```
app/(public)/explore/*
app/api/community/roadmaps/route.ts
app/api/community/roadmaps/[id]/related/route.ts
app/api/reviews/[roadmapId]/route.ts
app/api/reviews/[reviewId]/route.ts
components/explore/*
components/roadmap/roadmap-card.tsx
lib/api/community.ts
lib/api/reviews.ts
lib/query/use-community.ts
lib/query/use-reviews.ts
lib/domains/community/community.service.ts
lib/domains/community/reviews.service.ts
```

**Definition of Done:**
- [ ] Explore page correctly shows only public roadmaps, with working search, filter, sort, and pagination.
- [ ] Skeleton loaders appear during fetch and match the real card layout.
- [ ] A user cannot review their own roadmap, and cannot submit a second review on the same roadmap (both rejected with clear errors).
- [ ] Related roadmaps on a details page are relevant (matching career/tags) and exclude the current roadmap itself.

---

## Phase 9 — AI Career Coach (Streaming Chat)

**Objective:** The full contextual chat experience works end-to-end with real streaming.

**Build:**
- `app/api/chat/[roadmapId]/conversation/route.ts` (`GET` — get-or-create), `app/api/chat/[conversationId]/messages/route.ts` (`GET`, `POST` — streaming) per `api-contract.md` §5 and `permissions.md` §4.
- `lib/ai/coach-agent.ts` + `lib/ai/prompts/coach-prompt.ts` per `ai-pipeline.md` §3, with the context-assembly logic in `lib/domains/ai-coach/chat.service.ts` (§3.2) pulling real roadmap/progress/message data. The `POST` route handler returns a streaming `Response` (Next.js Route Handlers support standard `ReadableStream`/`Response` streaming natively — no special SSE library needed beyond what's already used for the token event shape in `api-contract.md` §5).
- Frontend: chat page — message list (user/assistant bubbles), chat input, streamed token rendering with typing indicator, suggested-questions row per the original spec.

**Files Allowed:**
```
app/(protected)/chat/*
app/api/chat/[roadmapId]/conversation/route.ts
app/api/chat/[conversationId]/messages/route.ts
components/chat/*
lib/api/chat.ts
lib/query/use-chat.ts
lib/domains/ai-coach/chat.service.ts
lib/ai/coach-agent.ts
lib/ai/prompts/coach-prompt.ts
```

**Definition of Done:**
- [ ] Sending a message streams tokens progressively in the UI, not all at once.
- [ ] The AI's response is demonstrably context-aware (test: ask "what should I learn next" and confirm it references the actual current roadmap topics, not generic advice).
- [ ] Both messages (user + assistant) persist correctly and reappear on reload/re-entering the conversation.
- [ ] A second visit to chat for the same roadmap reuses the existing conversation rather than creating a new one, per `database-schema.md` §5.
- [ ] A user cannot access another user's conversation via a guessed/known ID.

---

## Phase 10 — Dashboard

**Objective:** The aggregated dashboard is live, pulling real data across domains.

**Build:**
- `app/api/dashboard/route.ts` (`GET`) per `api-contract.md` §6 (read-only aggregation across roadmaps/progress/ai-coach per `architecture.md` §7).
- Frontend: stat cards, progress chart (reusing Phase 7's chart component), current roadmaps list, recent AI conversations, learning calendar/upcoming goals if time allows within this phase.

**Files Allowed:**
```
app/(protected)/dashboard/page.tsx
app/api/dashboard/route.ts
components/dashboard/*
lib/api/dashboard.ts
lib/query/use-dashboard.ts
lib/domains/dashboard/dashboard.service.ts
```

**Definition of Done:**
- [ ] Stats reflect real data (not hardcoded) for a test account with at least one roadmap and one chat.
- [ ] Dashboard only reads — confirm no write endpoints were added here.
- [ ] Empty-state (a brand-new user with no roadmaps yet) renders sensibly rather than breaking.

---

## Phase 11 — Remaining Public Pages

**Objective:** About, Blog, Contact exist and are consistent with the design system.

**Build:**
- Static/simple content pages using existing design-system components — no new backend endpoints required unless Contact needs a submission endpoint (if so, keep it minimal: a single `app/api/contact/route.ts` (`POST`) that stores or forwards the message, not a full domain).

**Files Allowed:**
```
app/(public)/about/*
app/(public)/blog/*
app/(public)/contact/*
app/api/contact/route.ts   (only if a submission endpoint is needed)
```

**Definition of Done:**
- [ ] All three pages are responsive and themed correctly in both modes.
- [ ] Contact form (if built) submits successfully and shows a clear confirmation state.

---

## Phase 12 — Cross-Cutting Polish

**Objective:** The app feels finished, not just functional.

**Build:**
- Pass over every page for responsive correctness (mobile/tablet/desktop) per the original requirement checklist.
- Confirm every loading state has a skeleton or spinner, every empty state has clear guidance text, and every error state is handled gracefully (no unhandled promise rejections visible to the user).
- Confirm dark/light mode consistency across every page, not just the ones built early.
- Remove any leftover placeholder/lorem-ipsum content that was acceptable temporarily in Phase 4.

**Files Allowed:** any file already created in prior phases (no new files/domains introduced in this phase).

**Definition of Done:**
- [ ] Full click-through of every page in both themes, at three breakpoints, with no visual breakage.
- [ ] Every list view (roadmaps, explore, reviews, messages) has a working empty state.
- [ ] Every mutation (create, update, delete) has a visible success/error state — nothing fails silently.

---

## Phase 13 — Deployment

**Objective:** The application is live and reachable.

**Build:**
- Environment variables finalized for production (MongoDB URI, Groq API key, Better Auth secrets/OAuth credentials) — never committed to the repo.
- Deploy the single Next.js app to its hosting target (e.g. Vercel) — one deployment, no separate backend to configure or point at.
- Confirm production environment variables are set on the hosting platform, and confirm no secret env var is prefixed `NEXT_PUBLIC_` (per `architecture.md` §6).
- Smoke-test the full critical path in production: register → create roadmap → mark progress → chat → explore → review.

**Files Allowed:** deployment config files only (e.g. `vercel.json`, environment config, build scripts) — no application logic changes in this phase.

**Definition of Done:**
- [ ] Production URL loads the landing page correctly.
- [ ] Full critical path (above) works end-to-end in production, not just locally.
- [ ] No secrets are present in the deployed repo/client bundle.
- [ ] Both light and dark mode work correctly in production build (confirms no dev-only CSS issue).

---

## What This Document Does Not Cover

- The living record of what's actually been completed and any decisions made along the way → `project-memory.md`