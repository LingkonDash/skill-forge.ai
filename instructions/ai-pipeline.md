# AI Pipeline — SkillForge AI

## Purpose of This Document

This document defines both AI agents in implementation detail: prompt construction, context assembly, the Groq call pattern, output parsing, and streaming. Everything here lives in `lib/ai/*` per `folder-structure.md`, and must stay isolated from business logic per `architecture.md` §5 — this layer receives already-fetched data as input and returns generated content as output. It never queries the database or checks permissions itself.

**Server-only:** every file under `lib/ai/*` must never be imported into a `"use client"` component, per `architecture.md` §6. These files use the Groq API key and must only ever run server-side — inside route handlers or the service functions those route handlers call.

---

## 1. Groq Client Setup

`lib/ai/groq-client.ts` wraps the Groq SDK with a single configured instance, reading the API key from environment variables (`GROQ_API_KEY`, never `NEXT_PUBLIC_`-prefixed). Both agents call through this wrapper rather than instantiating their own clients, so model choice, timeouts, and retry behavior stay centralized.

```
- Model: a Groq-hosted model suitable for both structured generation (Agent 1)
  and conversational streaming (Agent 2) — one model config, reused by both.
- Timeout: requests that hang past a reasonable limit should fail with
  AI_GENERATION_FAILED (per api-contract.md §7) rather than hang indefinitely.
- No retry-with-backoff logic in this phase — a failed call surfaces the
  error immediately; the user can retry manually via the UI.
```

---

## 2. Agent 1 — Roadmap Generator

**File:** `lib/ai/roadmap-agent.ts`
**Called by:** `lib/domains/roadmaps/roadmaps.service.ts`

### 2.1 Function Contract

```
generateRoadmap(input: {
  careerGoal: string,
  currentSkills: string[],
  studyHours: number,
  difficulty: string,
  learningStyle: string
}): Promise<{
  weeks: { weekNumber, title, topics, resources, project, estimatedTime }[],
  tips: string[],
  estimatedDuration: string
}>
```

The service layer validates input, calls this function, and persists the result — this function only generates and parses, never saves.

### 2.2 Prompt Template

Built in `lib/ai/prompts/roadmap-prompt.ts`:

```
You are a senior software engineering mentor creating a personalized learning roadmap.

Career Goal: {careerGoal}
Current Skills: {currentSkills joined by comma}
Experience Level: {difficulty}
Weekly Study Hours: {studyHours}
Preferred Learning Style: {learningStyle}

Generate a week-by-week roadmap. For each week include:
- A short title for the week's focus
- 2-4 topics to learn
- 1-3 resource names or types (no fabricated URLs)
- One practice project matching that week's topics
- Estimated time to complete that week

Also include 3-5 general tips for this specific learner.

Respond with ONLY valid JSON matching this exact shape, no markdown fences, no commentary:
{
  "weeks": [
    { "weekNumber": number, "title": string, "topics": string[],
      "resources": string[], "project": string, "estimatedTime": string }
  ],
  "tips": string[],
  "estimatedDuration": string
}
```

**Note:** the prompt asks for raw JSON directly (not markdown) so parsing in §2.3 is a straightforward `JSON.parse`, avoiding fragile markdown-to-structure conversion.

### 2.3 Output Parsing

```
1. Strip any accidental leading/trailing whitespace or code fences (defensive,
   in case the model wraps output in ```json anyway).
2. JSON.parse the result.
3. Validate the parsed shape matches the contract in §2.1 (weeks is a
   non-empty array, each week has all required fields, tips is an array).
4. If parsing or validation fails, throw an error that the service layer
   surfaces as AI_GENERATION_FAILED — do not attempt partial recovery or
   silently substitute placeholder data.
```

### 2.4 Regeneration

Regeneration (`PATCH /api/roadmaps/[id]` with `regenerate: true`) calls this same function again with the roadmap's original input fields and overwrites `generatedRoadmap` wholesale, per `database-schema.md` §8 — never a partial merge.

---

## 3. Agent 2 — AI Career Coach

**File:** `lib/ai/coach-agent.ts`
**Called by:** `lib/domains/ai-coach/chat.service.ts`

### 3.1 Function Contract

```
streamCoachResponse(context: {
  careerGoal: string,
  completedTopics: string[],
  completionPercentage: number,
  currentWeekTopics: string[],
  recentMessages: { role: "user" | "assistant", content: string }[],
  userMessage: string
}): AsyncIterable<string>  // yields text chunks as they arrive
```

`chat.service.ts` is responsible for gathering everything in `context` — fetching the roadmap, progress, and prior messages from MongoDB — before calling this function. `coach-agent.ts` never fetches anything itself.

### 3.2 Context Assembly (Business-Logic Side)

Performed in `chat.service.ts`, not in the AI layer:

```
1. Fetch the roadmap for this conversation → careerGoal, generatedRoadmap.
2. Fetch progress for this roadmap → completedTopics, completionPercentage.
3. Determine currentWeekTopics: the first week in generatedRoadmap.weeks
   whose topics aren't all present in completedTopics.
4. Fetch the last N messages (a small fixed window, e.g. the most recent
   10) from this conversation, ordered oldest to newest.
5. Pass all of the above, plus the new userMessage, into streamCoachResponse.
```

### 3.3 Prompt Template

Built in `lib/ai/prompts/coach-prompt.ts`:

```
You are the user's personal career mentor and learning coach.

Career Goal: {careerGoal}
Completed Topics: {completedTopics joined by comma}
Overall Progress: {completionPercentage}%
Current Focus: {currentWeekTopics joined by comma}

Recent conversation:
{recentMessages formatted as "User: ..." / "Coach: ..." lines}

User: {userMessage}

Give practical, encouraging, specific advice grounded in the user's actual
roadmap and progress above. Reference their current focus topics when
relevant. Keep responses conversational, not a wall of bullet points,
unless the user is asking for a list.
```

### 3.4 Streaming Implementation

Implemented as a Next.js Route Handler returning a native streaming `Response` — there is no separate SSE library or Express controller layer; Next.js Route Handlers support `ReadableStream` directly.

```
1. app/api/chat/[conversationId]/messages/route.ts (POST) calls chat.service.ts
   to assemble context, then calls streamCoachResponse from coach-agent.ts.
2. coach-agent.ts calls the Groq client with streaming enabled, passing the
   built prompt, and yields each token/chunk immediately from its async
   generator as it arrives.
3. The route handler wraps that async generator in a ReadableStream, encoding
   each chunk as an SSE-style `token` event (per api-contract.md §5) into the
   Response body, and returns the Response with the appropriate streaming
   headers (Content-Type: text/event-stream).
4. The route handler accumulates the full response text as chunks are
   streamed out (for persistence after streaming completes) — accumulation
   happens in the route handler, not inside coach-agent.ts.
5. On stream completion, the route handler persists both the user message
   and the full assistant message to MongoDB, then emits the final `done`
   event with the new message's _id, before closing the stream.
6. If the stream errors mid-way, the route handler sends an error event,
   closes the stream, and does not persist a partial/broken assistant message.
```

---

## 4. Error Handling

Both agents surface failures the same way: throw an error that the calling service catches and translates into the `AI_GENERATION_FAILED` error code (`api-contract.md` §7). Neither agent should:
- Retry automatically
- Return placeholder/fallback content silently
- Log the raw prompt content in a way that would leak user data into shared logs (log request metadata, not full prompt bodies, in production)

---

## 5. What This Document Does Not Cover

- Endpoint routes/shapes for triggering these agents → `api-contract.md`
- Who is allowed to trigger generation or chat for a given resource → `permissions.md`
- Database fields being read/written around these calls → `database-schema.md`
- Frontend rendering of streamed tokens and typing indicators → `ui-guidelines.md`
- Server-only import boundaries → `architecture.md` §6