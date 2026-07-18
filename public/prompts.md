## Your first prompt

Paste this as the first task:

```
Read the instructions/ folder in this order before doing anything else:
00-agent-brief.md, then architecture.md, folder-structure.md, database-schema.md,
api-contract.md, auth-rules.md, permissions.md, ai-pipeline.md, coding-guidelines.md,
ui-guidelines.md, implementation-phases.md, and project-memory.md.

Then check the current state of the client/ and server/ folders — client/ already
has a raw Next.js install, server/ already has a raw npm init, nothing else exists yet.

Update project-memory.md to reflect what's actually already present.

Then execute Phase 0 (Project Scaffolding & Environment) from implementation-phases.md
only. Do not start Phase 1. Follow the Files Allowed list for Phase 0 exactly.

When Phase 0 is complete, verify it against Phase 0's Definition of Done checklist,
update project-memory.md with the results, and stop for my review before continuing.
```

## The loop for every phase after that

Once you've checked Phase 0's plan/result, the repeating prompt is basically:

```
Read project-memory.md for current status. Execute Phase <N> from
implementation-phases.md only. Follow that phase's Files Allowed list strictly.
When done, verify against that phase's Definition of Done, update project-memory.md,
and stop for my review.
```

That's your audit checkpoint every single phase — you read `project-memory.md`'s Build Log entry, glance at the Plan Artifact it produced, and either say "continue to Phase N+1" or correct something before it moves on.