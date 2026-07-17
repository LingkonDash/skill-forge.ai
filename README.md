# SkillForge AI

### AI-Powered Career Roadmap & Learning Coach

A full-stack, AI-integrated learning platform that generates personalized career roadmaps and provides contextual AI mentorship — built end-to-end with Next.js, MongoDB, and Groq.

---

## Overview

Most learning roadmaps online are static — the same 12-week plan for every visitor, regardless of skill level, goals, or pace. SkillForge AI replaces that with two purpose-built AI agents that reason over real user data:

- **Roadmap Generator** — builds a personalized, week-by-week learning plan from a user's career goal, current skills, available study time, and learning style.
- **AI Career Coach** — a context-aware chat assistant that reads the user's actual roadmap and progress before answering, so advice is grounded in what they've already learned rather than generic tips.

The platform also includes full roadmap management, a public roadmap community with search/filter/reviews, and progress tracking with visual analytics — all wrapped in a single Next.js application with light/dark mode support.

---

## Live Demo

**[View Live App →](#)**

**[Watch Demo Video →](#)**

*(Links added on deployment)*

---

## Key Features

**AI-Driven Personalization**
- Structured roadmap generation via Groq LLM, tailored to career goal, skill level, and weekly time commitment
- Context-aware AI coach that reads current roadmap, completed topics, and prior conversation history before every response
- Streaming chat responses with a natural, progressive typing experience

**Full Roadmap Lifecycle**
- Create, view, edit, regenerate, and delete personal roadmaps
- Mark milestones complete with automatically calculated progress percentage
- Visual progress tracking via charts

**Community & Discovery**
- Public roadmap library with search, career/difficulty filters, sorting, and pagination
- Ratings and written reviews on public roadmaps
- Related-roadmap recommendations

**Authentication & Access Control**
- Email/password, Google OAuth, and Demo Login
- Session-based route protection across the app
- Resource-level ownership and permission enforcement on every read/write

**Polished UI/UX**
- Fully responsive across mobile, tablet, and desktop
- Light/dark theme toggle with persisted preference
- Component-driven design system built on a deliberately restrained color palette

---

## Tech Stack

**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS
- TanStack Query
- Recharts (data visualization)
- Framer Motion + GSAP (animation)

**Backend**
- Next.js API Route Handlers (single full-stack app — no separate backend server)
- MongoDB + Mongoose
- Better Auth (email, Google OAuth, session management)

**AI**
- Groq (LLM inference for both the roadmap generator and the career coach)
- Custom prompt engineering with structured JSON output parsing
- Native streaming responses for real-time chat

---

## System Architecture

SkillForge AI runs as a single unified Next.js application — frontend and backend share one codebase, one deployment, and one origin (no CORS layer needed).

```
Browser
  │
  ▼
Next.js Frontend (App Router)
  │  TanStack Query
  ▼
API Route Handlers (app/api/*)
  │
  ├──► Business Logic / Permissions (lib/domains/*)
  │        │
  │        ▼
  │     MongoDB (persistence)
  │
  └──► AI Orchestration Layer (lib/ai/*)
           │
           ▼
         Groq (LLM)
```

**Design principle:** AI orchestration (prompt construction, context assembly, streaming) is fully isolated from business logic (auth, permissions, persistence). The AI layer never touches the database directly — it only receives already-fetched context and returns generated content, which keeps the two concerns independently testable and swappable.

---

## AI System Design

### Agent 1 — Roadmap Generator
Takes structured user input (career goal, current skills, experience level, weekly hours, learning style), builds a single prompt, and returns a strict JSON-shaped roadmap (weekly topics, resources, projects, estimated time, and tips) that gets parsed, validated, and persisted.

### Agent 2 — AI Career Coach
Before every response, the backend assembles real context — the user's current roadmap, completed topics, overall progress percentage, and recent conversation history — and passes it into the prompt. This is what allows the coach to give advice like *"since you've finished JavaScript fundamentals, focus on TypeScript before React"* instead of generic, disconnected suggestions. Responses stream token-by-token for a natural chat feel.

---

## Project Structure

```
skillforge-ai/
├── app/
│   ├── (public)/          # Landing, explore, about, blog, contact, auth pages
│   ├── (protected)/       # Dashboard, roadmap creation/management, chat, profile
│   └── api/                # All backend route handlers, organized by domain
├── components/
│   ├── ui/                 # Reusable design system primitives
│   ├── landing/ explore/ dashboard/ roadmap/ chat/
├── lib/
│   ├── domains/             # Business logic + permission enforcement per domain
│   ├── ai/                  # AI orchestration layer (prompts, Groq client, agents)
│   ├── db/                  # Mongoose models + connection
│   ├── auth/                # Better Auth client config
│   └── query/                # TanStack Query hooks
└── instructions/            # Full architecture & spec documentation (see below)
```

---

## Engineering Approach

This project was built spec-first: before any code was written, the full system was designed across a dedicated set of architecture documents — domain boundaries, database schema, API contracts, permission rules, AI prompt pipelines, coding conventions, and a UI design system — all written and finalized up front. Implementation then proceeded in ordered, independently verifiable phases, from project scaffolding through deployment, with each phase gated by an explicit definition of done.

This approach mirrors how production systems are actually planned in industry: architecture and contracts precede implementation, ownership boundaries are explicit, and AI-assisted development is treated as execution against a spec rather than freeform generation.

*(Full internal architecture documentation available in `/instructions` for anyone interested in the design process.)*

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection (local or Atlas)
- A Groq API key
- Google OAuth credentials (optional, for Google login)

### Setup

```bash
# Clone the repository
git clone https://github.com/lingkondash/skillforge-ai.git
cd skillforge-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Fill in MONGODB_URI, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, GROQ_API_KEY

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to view the app.

---

## Screenshots

| Landing Page | Dashboard | AI Chat |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

| Roadmap View | Explore Page | Dark Mode |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## Author

**Lingkon Dash**
Frontend-focused Full-Stack Developer

- GitHub: [github.com/lingkondash](https://github.com/lingkondash)
- LinkedIn: [linkedin.com/in/lingkon-dash](https://linkedin.com/in/lingkon-dash)

---

## License

This project is available for portfolio and educational reference. Reach out via LinkedIn for any collaboration inquiries.