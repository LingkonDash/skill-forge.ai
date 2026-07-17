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
| 0 — Project Scaffolding & Environment | Not Started | |
| 1 — Database Models | Not Started | |
| 2 — Authentication | Not Started | |
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

- _No entries yet — this section fills in as phases are completed._

---

## Decisions Made

*(Log any decision made during implementation that wasn't already specified in the instruction docs — e.g. a library version pinned, an edge case resolved a specific way. Include brief reasoning.)*

- _No entries yet._

---

## Open Items / Deferred Work

*(Anything intentionally skipped, stubbed, or left for later — so it isn't mistaken for finished, and isn't lost.)*

- _No entries yet._

---

## Current State Summary

*(Keep this section short and current — overwrite it each time, unlike the logs above which only append. A few sentences on: what works end-to-end right now, and what the very next piece of work is.)*

Nothing built yet. Next step: Phase 0 — project scaffolding.