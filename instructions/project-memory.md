# Project Memory — SkillForge AI

## Purpose of This Document

This is the living record of build progress. Unlike the other instruction files, this one is **updated by the agent as work happens**, not written once and left static. Before starting any phase, read this file to see what's already done and any decisions/blockers logged. After completing a phase (or a meaningful chunk of one), update this file before moving on.

Do not rewrite history in this file — append new status/decisions, don't delete prior entries. If something changes (e.g. a decision gets reversed), add a new dated line noting the change rather than erasing the old one.

---

## How to Update This File

After finishing work on a phase:
1. Update that phase's status in the table below.
2. Add a short entry under **Build Log** describing what was actually built, in plain terms — a future reader (human or agent) should understand the current state without reading the code.
3. If any decision was made that wasn't already specified in the instruction docs (and had to be made to keep moving), log it under **Decisions Made** with the reasoning.
4. If something is blocked or intentionally deferred, log it under **Open Items** so it isn't silently forgotten.

---

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 0 — Project Scaffolding & Environment | Complete | Handled Next.js 16 and Tailwind v4 deprecations/conventions |
| 1 — Database Models | Complete | All 6 Mongoose models implemented and tested |
| 2 — Authentication | Complete | Better Auth integration with MongoDB adapter |
| 3 — Core Design System & Layout | Not Started | |
| 4 — Landing Page | Not Started | |
| 5 — Roadmap Creation (AI Slice) | Not Started | |
| 6 — Roadmap Management | Not Started | |
| 7 — Progress Tracking | Not Started | |
| 8 — Community: Explore & Reviews | Not Started | |
| 9 — AI Career Coach (Streaming) | Not Started | |
| 10 — Dashboard | Not Started | |
| 11 — Remaining Public Pages | Not Started | |
| 12 — Cross-Cutting Polish | Not Started | |
| 13 — Deployment | Not Started | |

Status values: `Not Started` → `In Progress` → `Complete`. Only mark `Complete` once every item in that phase's Definition of Done (in `implementation-phases.md`) is actually satisfied — not when the code merely exists.

---

## Build Log

*(Newest entries at the top. Each entry: date, phase, what was actually built/verified.)*

- **2026-07-18**: Phase 2 — Integrated Better Auth with MongoDB (`@better-auth/mongo-adapter`), mapping to the existing `User` schema. Implemented `proxy.ts` middleware route protection utilizing native fetch. Built frontend login and register pages with basic UI, updating the navbar to include auth state and a working theme toggle.
- **2026-07-18**: Phase 1 — Implemented all six Mongoose models (`User`, `Roadmap`, `Progress`, `Review`, `Conversation`, `Message`) based strictly on the `database-schema.md`. Correctly applied `toJSON` transform on the `User` model to omit `passwordHash`, and defined all unique and compound indexes. Executed a manual test script to verify successful insertion and validation of all models.
- **2026-07-18**: Phase 0 — Scaffolded single unified Next.js 16 application, configured Mongoose connection wrapper (`lib/db/connection.ts`), verified database connection via the public health-check route `/api/health` returning `{"success":true,"data":{"status":"ok","db":"connected"}}`. Set up Next.js 16 `proxy.ts` (pass-through router protection shell), integrated Tailwind CSS v4 design tokens in `app/globals.css`, and configured root layout with injected theme initialization script (`lib/utils/theme.ts`). Created empty Mongoose model shells in `lib/db/models/` and empty domain folder structures in `lib/domains/`.

---

## Decisions Made

*(Log any decision made during implementation that wasn't already specified in the instruction docs — e.g. a library version pinned, an edge case resolved a specific way. Include brief reasoning.)*

- **Consolidated Single App Architecture**: Migrated from the three-tier Express/React split to a single consolidated Next.js App Router application. Enforced client/server boundary conventions strictly per the guidelines.
- **Next.js 16 Proxy Routing**: Renamed deprecated `middleware.ts` to `proxy.ts` and exported `proxy` function instead of `middleware` to align with Next.js 16 specifications and eliminate startup warnings.
- **Tailwind CSS v4 Integration**: Configured visual color tokens directly inside `@theme` in `app/globals.css` with a data-theme switcher on the `<html>` element, replacing the standalone `tailwind.config.ts` per Tailwind v4 configuration specifications.

---

## Open Items / Deferred Work

*(Anything intentionally skipped, stubbed, or left for later — so it isn't mistaken for finished, and isn't lost.)*

- _No entries yet._

---

## Current State Summary

*(Keep this section short and current — overwrite it each time, unlike the logs above which only append. A few sentences on: what works end-to-end right now, and what the very next piece of work is.)*

Phase 2 (Authentication) is complete. Better Auth is integrated natively with MongoDB and our `User` schema. Route protection is handled gracefully through Next.js proxy middleware, and users can register and login. The next piece of work is Phase 3 — Core Design System & Layout.