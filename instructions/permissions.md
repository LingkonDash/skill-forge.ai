# Permissions — SkillForge AI

## Purpose of This Document

This document defines ownership and access-control rules — who can read, write, or delete each resource. `auth-rules.md` establishes *who* the user is; this document establishes *what* they're allowed to do once identified. Every protected write/delete endpoint in `api-contract.md` must enforce the rule defined here for its resource, in addition to (not instead of) auth middleware.

Ownership checks live in each domain's service layer (`server/src/domains/<domain>/*.service.ts`), not in `lib/ai/*` and not in middleware — middleware only confirms identity (`auth-rules.md` §5–6).

---

## 1. Roadmaps

| Action | Rule |
|---|---|
| Create | Any authenticated user |
| Read (own) | Owner only — `roadmap.userId === req.user._id` |
| Read (public) | Anyone, if `roadmap.isPublic === true` |
| Update (`isPublic`, `tags`, regenerate) | Owner only |
| Delete | Owner only |

- A non-owner requesting a private roadmap (`isPublic: false`) receives `FORBIDDEN`, not `NOT_FOUND` — but see §6 on information leakage before changing this.
- Deleting a roadmap cascades to its `Progress` document and its `Conversation`/`Message` documents (see §7).

---

## 2. Progress

| Action | Rule |
|---|---|
| Read | Owner of the parent roadmap only |
| Update (`completedTopics`) | Owner of the parent roadmap only |

- There is no public read access to Progress, even if the parent roadmap is public — progress is personal learning data, not part of the community listing.
- The service layer must verify roadmap ownership by looking up the roadmap's `userId`, not just trusting a `roadmapId` passed in the URL.

---

## 3. Reviews

| Action | Rule |
|---|---|
| Read | Anyone, if the parent roadmap is public |
| Create | Any authenticated user, only on a public roadmap, max one review per user per roadmap (enforced by the unique index in `database-schema.md` §4) |
| Delete | Review author only |

- A user cannot review their own roadmap — reject with `VALIDATION_ERROR` if `review.userId === roadmap.userId`.
- Attempting a second review on the same roadmap returns `VALIDATION_ERROR`, not a silent overwrite.

---

## 4. Conversations & Messages

| Action | Rule |
|---|---|
| Read conversation | Owner of the conversation's `userId` only |
| Create conversation | Owner of the parent roadmap only (a conversation is always self-owned, never created for another user) |
| Read messages | Owner of the parent conversation only |
| Send message | Owner of the parent conversation only |

- Ownership check for chat endpoints must verify both: the conversation belongs to `req.user`, **and** the conversation's `roadmapId` still belongs to that same user (in case a roadmap was transferred or deleted — out of scope for now, but the check should exist defensively).
- There is no shared/collaborative chat in this version — one user per conversation, always.

---

## 5. Community / Explore

| Action | Rule |
|---|---|
| List/search public roadmaps | Anyone (no auth required) |
| View a public roadmap's details | Anyone |
| View a private roadmap's details | Owner only |

- The explore query (`GET /api/community/roadmaps`) must filter at the database level for `isPublic: true` — never fetch all roadmaps and filter client-side or post-query.

---

## 6. Ownership Check Pattern

Every service function that touches a user-owned resource follows the same pattern, to keep enforcement consistent across domains:

```
function assertOwnership(resource, userId) {
  if (!resource) throw new NotFoundError();
  if (resource.userId.toString() !== userId.toString()) {
    throw new ForbiddenError();
  }
}
```

Controllers call the relevant fetch, then this check, before performing any read/write beyond existence. This function (or its domain-specific equivalents) lives alongside each domain's service — it is not shared as a single generic cross-domain utility, since "ownership" means something slightly different in each domain (direct `userId`, or via parent roadmap).

---

## 7. Cascade Rules

| On this action | Cascade |
|---|---|
| Delete Roadmap | Delete its `Progress` document, all `Conversation` documents for that roadmap, and all `Message` documents under those conversations |
| Delete User | Out of scope for this phase — account deletion is not part of the current feature set |

Cascades are performed in the roadmaps domain's delete service function, not left to the database (no Mongo-native cascading is assumed).

---

## 8. What This Document Does Not Cover

- How identity/session is established → `auth-rules.md`
- Endpoint shapes and error code values → `api-contract.md`
- Data shape being protected → `database-schema.md`