# API Contract — SkillForge AI

## Purpose of This Document

This document defines every backend endpoint: method, path, auth requirement, request shape, and response shape. The agent implements routes/controllers to match this exactly — do not invent additional endpoints or change response shapes without updating this document first.

All responses follow a consistent envelope (see `coding-guidelines.md` for the shared response helper):
```
Success: { success: true, data: <payload> }
Error:   { success: false, error: { message: string, code: string } }
```

Field types below assume the schemas defined in `database-schema.md`.

---

## 1. Auth Domain

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Email + password registration |
| POST | `/api/auth/login` | Public | Email + password login |
| POST | `/api/auth/google` | Public | Google OAuth login/callback |
| POST | `/api/auth/demo` | Public | Demo account login |
| POST | `/api/auth/logout` | Session | Invalidate current session |
| GET | `/api/auth/session` | Session | Return current authenticated user |

**POST `/api/auth/register`**
```
Request:  { name: string, email: string, password: string }
Response: { user: { _id, name, email, image, provider, createdAt } }
```

**POST `/api/auth/login`**
```
Request:  { email: string, password: string }
Response: { user: { _id, name, email, image, provider, createdAt } }
```

Detailed session/token mechanics are defined in `auth-rules.md` — this table only defines the HTTP surface.

---

## 2. Roadmaps Domain

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/roadmaps` | Protected | Create + generate a new roadmap |
| GET | `/api/roadmaps` | Protected | List current user's roadmaps |
| GET | `/api/roadmaps/:id` | Protected/Public* | Get single roadmap |
| PATCH | `/api/roadmaps/:id` | Protected (owner) | Update `isPublic`/`tags`, or trigger regenerate |
| DELETE | `/api/roadmaps/:id` | Protected (owner) | Delete a roadmap |

*`GET /api/roadmaps/:id` is public if the roadmap's `isPublic` is `true`; otherwise requires ownership. Enforcement rules live in `permissions.md`.

**POST `/api/roadmaps`**
```
Request:
{
  careerGoal: string,
  currentSkills: string[],
  studyHours: number,
  difficulty: "beginner" | "intermediate" | "advanced",
  learningStyle: "video" | "reading" | "practice" | "mixed"
}

Response:
{
  roadmap: {
    _id, userId, careerGoal, currentSkills, studyHours,
    difficulty, learningStyle, generatedRoadmap, estimatedDuration,
    isPublic, tags, createdAt, updatedAt
  }
}
```

**PATCH `/api/roadmaps/:id`**
```
Request (partial update):
{ isPublic?: boolean, tags?: string[] }

OR (regenerate):
{ regenerate: true }

Response: { roadmap: <same shape as above> }
```

---

## 3. Progress Domain

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/progress/:roadmapId` | Protected (owner) | Get progress for a roadmap |
| PATCH | `/api/progress/:roadmapId` | Protected (owner) | Mark topic(s) complete/incomplete |

**PATCH `/api/progress/:roadmapId`**
```
Request:  { completedTopics: string[] }   // full replacement list

Response:
{
  progress: {
    _id, roadmapId, completedTopics,
    completionPercentage, lastUpdated
  }
}
```

`completionPercentage` is always computed server-side (see `database-schema.md` §8) — the client never sends it.

---

## 4. Community Domain (Explore + Reviews)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/community/roadmaps` | Public | Search/filter/sort public roadmaps |
| GET | `/api/community/roadmaps/:id/related` | Public | Related roadmaps by career/tags |
| GET | `/api/reviews/:roadmapId` | Public | List reviews for a roadmap |
| POST | `/api/reviews/:roadmapId` | Protected | Create a review |
| DELETE | `/api/reviews/:reviewId` | Protected (owner) | Delete own review |

**GET `/api/community/roadmaps`**
```
Query params: ?search=&career=&difficulty=&sort=(rating|recent)&page=&limit=

Response:
{
  roadmaps: [ { _id, careerGoal, difficulty, estimatedDuration, tags, avgRating, creatorName, createdAt } ],
  pagination: { page, limit, total, totalPages }
}
```

**POST `/api/reviews/:roadmapId`**
```
Request:  { rating: number, comment: string }
Response: { review: { _id, roadmapId, userId, rating, comment, date } }
```

---

## 5. AI Coach Domain

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/chat/:roadmapId/conversation` | Protected (owner) | Get or create conversation for a roadmap |
| GET | `/api/chat/:conversationId/messages` | Protected (owner) | Get message history |
| POST | `/api/chat/:conversationId/messages` | Protected (owner) | Send message, stream AI response |

**GET `/api/chat/:roadmapId/conversation`**
```
Response: { conversation: { _id, userId, roadmapId, createdAt } }
```
Reuses an existing conversation for that roadmap if one exists, per `database-schema.md` §5.

**POST `/api/chat/:conversationId/messages`**
```
Request:  { content: string }

Response: Server-Sent Events / chunked stream of tokens, e.g.:
  event: token   data: { text: string }
  event: done    data: { messageId: string }

After streaming completes, both the user message and assistant message
are persisted (see ai-pipeline.md for context assembly + streaming detail).
```

**GET `/api/chat/:conversationId/messages`**
```
Response:
{
  messages: [ { _id, conversationId, role, content, createdAt } ]
}
```

---

## 6. Dashboard Domain

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Protected | Aggregated dashboard data for current user |

**GET `/api/dashboard`**
```
Response:
{
  stats: { totalRoadmaps: number, avgCompletion: number, weeklyStudyHours: number },
  roadmaps: [ { _id, careerGoal, completionPercentage, updatedAt } ],
  recentConversations: [ { _id, roadmapId, lastMessagePreview: string, updatedAt } ]
}
```

This endpoint only reads/aggregates — it does not write to any collection. It composes data from `roadmaps`, `progress`, and `ai-coach` per the read-only cross-domain pattern in `architecture.md` §6.

---

## 7. Standard Error Codes

| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | No valid session |
| `FORBIDDEN` | Authenticated but not permitted (not owner) |
| `NOT_FOUND` | Resource doesn't exist |
| `VALIDATION_ERROR` | Request body failed validation |
| `AI_GENERATION_FAILED` | Groq call failed or returned unparseable output |

---

## 8. What This Document Does Not Cover

- Field-level schema detail → `database-schema.md`
- Who is allowed to call which endpoint on which resource → `permissions.md`
- Session cookie/token mechanics → `auth-rules.md`
- Prompt construction and streaming implementation → `ai-pipeline.md`