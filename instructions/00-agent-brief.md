# Agent Brief — SkillForge AI

## Purpose of This Document

This is the entry point. Read this file first, before touching any other instruction file or writing any code. It defines how you (the agent) are expected to operate across this entire project — your role, your boundaries, and how the rest of the `instructions/` folder fits together.

---

## 1. Your Role

You are implementing a fully-specified system, not designing one. Every architectural decision — domain boundaries, schema shapes, API contracts, permission rules, AI prompt design, visual design tokens, and build order — has already been made and documented. Your job is to execute against those decisions with the judgment and care of a senior engineer: correct, consistent, and unsurprising.

Concretely, this means:
- **You own implementation. You do not own decisions.** If a task seems to require a decision not already covered by an instruction file (a new field, a new endpoint, a new color, a different library), stop and flag it rather than choosing silently and moving on.
- **You do not "improve" the architecture as you go.** If something looks like it could be structured better, that's worth noting (see `project-memory.md`), not worth silently changing.
- **You do not skip ahead.** Work the phases in `implementation-phases.md` in order. A later phase's instructions assume everything in an earlier phase is genuinely done, not stubbed.
- **You stay inside your lane.** Every implementation task specifies which files are allowed. Do not touch files outside that list for a given task, even to fix something unrelated you noticed along the way — log it instead.

---

## 2. How the Instruction Files Fit Together

Read them in roughly this order of relevance depending on what you're doing:

| File | What it defines | When you need it |
|---|---|---|
| `architecture.md` | System-level domains, data flow, the two AI agents, where orchestration lives | Before writing anything — the mental model for everything else |
| `folder-structure.md` | Exact repo layout, "files allowed" convention | Every task — confirms where new code goes |
| `database-schema.md` | Collection fields, types, relationships, indexes | Any task touching MongoDB models or data shapes |
| `api-contract.md` | Every endpoint's method, path, request/response shape, error codes | Any task touching routes or frontend API calls |
| `auth-rules.md` | Session mechanics, login flows, protected routes | Any task touching login, sessions, or route protection |
| `permissions.md` | Who can read/write/delete which resources | Any task touching a write, update, or delete operation |
| `ai-pipeline.md` | Both AI agents in implementation detail — prompts, context assembly, streaming | Any task touching `lib/ai/*` |
| `coding-guidelines.md` | TypeScript conventions, error handling, styling rules, data-fetching patterns | Every task — general code quality baseline |
| `ui-guidelines.md` | Color tokens, typography, layout principles, component reuse, light/dark mode | Any task touching frontend UI |
| `implementation-phases.md` | The actual build plan, broken into ordered, auditable phases with Definitions of Done | Always — this is what tells you what to build next |
| `project-memory.md` | Living record of what's actually been built, decisions made, open items | Read before starting a phase; update after finishing one |

If two documents ever seem to conflict, the more specific document wins for its domain (e.g. `permissions.md` wins over a general assumption in `architecture.md`), and if the conflict seems like a real inconsistency rather than a specificity difference, flag it instead of guessing which one is "more right."

---

## 3. Working Rhythm

For every phase in `implementation-phases.md`:

1. **Read `project-memory.md` first** to see current status and any relevant prior decisions or open items.
2. **Read the phase's own instructions** in full — Objective, Build breakdown, Files Allowed, Definition of Done — before writing any code.
3. **Cross-reference the specific spec files it points to** (schema fields, endpoint shapes, permission rules, prompt templates, design tokens) rather than relying on memory of them from earlier in the project.
4. **Implement only within the Files Allowed list.**
5. **Verify against the Definition of Done checklist yourself** before considering the phase finished — don't just assume the code is correct because it compiles/runs.
6. **Update `project-memory.md`** — phase status, a build-log entry, any decisions made, any open items — before moving to the next phase.

---

## 4. Quality Bar

Build like a senior developer who will have to maintain this code after you: readable over clever, consistent over locally optimal, and honest about what isn't finished rather than papering over gaps. Specifically:

- No placeholder data left in place of a real implementation past the phase where it was explicitly allowed (only Phase 4's landing page content is explicitly allowed to stay static/placeholder — everything else should be real by the time its phase is marked complete).
- No silently swallowed errors — follow the error-handling pattern in `coding-guidelines.md` §2.2 everywhere.
- No duplicated components — check `client/components/ui/*` and the relevant domain folder before building something that might already exist, per `ui-guidelines.md` §5.
- No scope creep — if a phase's Definition of Done is met, stop there rather than continuing to add things the next phase covers.

---

## 5. What To Do When Something Is Unclear

In order of preference:
1. Check whether a later section of the same instruction file resolves it.
2. Check whether a different instruction file (per the table in §2) covers it.
3. If genuinely unspecified, make the smallest reasonable assumption needed to keep moving, implement it, and log the assumption clearly in `project-memory.md` under Decisions Made — do not block indefinitely on a question that has a sensible default.
4. Never invent a new architectural pattern, domain, or dependency to resolve ambiguity — flag it instead.