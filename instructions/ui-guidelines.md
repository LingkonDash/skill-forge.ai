# UI Guidelines — SkillForge AI

## Purpose of This Document

This document defines the visual design system: color tokens, typography, layout principles, component reuse rules, and the light/dark mode implementation. The agent must build every screen from these tokens — no ad-hoc hex values, no one-off component variants that duplicate something already in `client/components/ui/*`.

---

## 1. Color System — Max 4 Colors

The palette is deliberately restrained: **one primary, one accent, plus neutrals**. Do not introduce additional brand colors anywhere in the app (marketing pages, dashboard charts, badges, etc.) — if something needs a color, it comes from this system.

Rationale: a roadmap is a *path* — steady, directional progress toward a goal, punctuated by milestones. The palette reflects that: a deep, confident teal for the steady path, and a warm gold for the moments of achievement along it. This avoids the cliché terracotta-on-cream and black-with-acid-green looks that flood AI-built products right now.

### 1.1 Core Tokens

| Role | Name | Light mode | Dark mode |
|---|---|---|---|
| Primary | Signal Teal | `#0F766E` | `#2DD4BF` |
| Accent | Ember Gold | `#D97706` | `#FBBF24` |
| Background | — | `#FAFAF9` | `#12181B` |
| Surface (cards/panels) | — | `#FFFFFF` | `#1B2327` |
| Text — primary | — | `#14181C` | `#EDEFF0` |
| Text — muted | — | `#5B6469` | `#8B959A` |
| Border | — | `#E4E7E8` | `#2A3438` |
| Error (utility only, not decorative) | — | `#DC2626` | `#F87171` |

**Note on the error color:** it exists for validation/destructive-action states only (form errors, delete confirmations) — it is never used decoratively and doesn't count against the "3-4 color" budget since it's a functional utility color, not part of the brand palette.

### 1.2 Usage Rules

- **Primary (teal)** — primary buttons, active nav states, links, progress bar fill, focus rings.
- **Accent (gold)** — used sparingly, only for things that represent achievement or attention: completed milestone badges, streak indicators, the "current focus" highlight in a roadmap, star ratings. Never used for large surfaces or backgrounds.
- **Neutrals** — everything else: body text, borders, card surfaces, disabled states.
- No gradients combining primary and accent. If a gradient is needed anywhere (e.g. a hero background), it should be a subtle tonal gradient within the teal family, not a rainbow/multi-hue blend.

### 1.3 CSS Variable Implementation

Define tokens once as CSS custom properties, switched by a `data-theme` attribute on `<html>`:

```css
:root[data-theme="light"] {
  --color-primary: #0F766E;
  --color-accent: #D97706;
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-text: #14181C;
  --color-text-muted: #5B6469;
  --color-border: #E4E7E8;
  --color-error: #DC2626;
}

:root[data-theme="dark"] {
  --color-primary: #2DD4BF;
  --color-accent: #FBBF24;
  --color-bg: #12181B;
  --color-surface: #1B2327;
  --color-text: #EDEFF0;
  --color-text-muted: #8B959A;
  --color-border: #2A3438;
  --color-error: #F87171;
}
```

Tailwind config maps utility classes to these variables (e.g. `bg-surface`, `text-muted`, `border-border`, `bg-primary`) rather than components hardcoding Tailwind's default palette (`bg-blue-600`, etc.). No component should reference a raw Tailwind color class outside this mapped set.

---

## 2. Light/Dark Mode Toggle

- A toggle control lives in the navbar (both public and protected layouts), always visible.
- Theme state is controlled by setting `data-theme="light"` or `data-theme="dark"` on the root `<html>` element.
- On first load: check `localStorage` for a saved preference; if none exists, fall back to the user's OS-level preference (`prefers-color-scheme`); persist the resolved theme to `localStorage` once determined.
- Every subsequent toggle updates both the `data-theme` attribute and `localStorage` immediately — no flash of the wrong theme on navigation.
- This logic lives in one shared theme provider/hook (`client/lib/utils/theme.ts` or equivalent) — do not reimplement theme switching per page.
- Every component must be built using the token-mapped Tailwind classes from §1.3 so it works correctly in both modes automatically — no component should hardcode a light-only or dark-only color.

---

## 3. Typography

| Role | Typeface | Usage |
|---|---|---|
| Display | A geometric sans with some character (e.g. "Space Grotesk" or similar) | Hero headline, section titles, dashboard stat numbers |
| Body | A clean, highly legible sans (e.g. "Inter") | Paragraphs, form labels, nav, buttons |
| Mono (data/utility) | A standard mono (e.g. "JetBrains Mono") | Timestamps, code-like snippets if any appear, stat labels where a technical feel fits |

- Type scale: define 6–7 steps (e.g. `text-xs` through a large display size) and use them consistently — no arbitrary one-off font sizes in components.
- Headings are set in the display face at a confident weight (600–700); body copy stays at regular/medium weight for readability.
- Keep line-length readable — cap prose blocks (blog, about, roadmap descriptions) at a comfortable measure rather than letting text stretch full-width on large screens.

---

## 4. Layout Principles

- **Hero (landing page):** open with the roadmap concept itself made visible — not a generic headline-plus-stock-illustration. A simple animated/illustrated representation of a path with milestones lighting up in sequence is more on-brief than a generic dashboard screenshot.
- **Dashboard:** stat cards + progress chart + recent activity, in a clear grid — information-dense but not cluttered. Use whitespace and card surfaces (`bg-surface`) to separate sections rather than heavy borders everywhere.
- **Explore grid:** responsive card grid, consistent card component (see §5) reused for every roadmap regardless of context (explore, dashboard, related roadmaps).
- **Chat interface:** message bubbles left/right aligned by role, generous vertical spacing, input pinned to the bottom with the streaming response rendered inline as it arrives.
- Numbered markers (01 / 02 / 03) are appropriate for the roadmap's actual weekly sequence (it genuinely is an ordered timeline) but should not be used decoratively elsewhere just for visual rhythm.

---

## 5. Component Reuse

This is a hard rule: **build each UI primitive once, in `client/components/ui/*`, and reuse it everywhere.**

- Buttons, inputs, selects, cards, badges, modals, skeleton loaders, and the roadmap card component each exist as exactly one implementation, accepting props for variants (e.g. `<Button variant="primary" | "secondary" | "ghost">`), not copy-pasted per page with slightly different markup.
- Before building a new component for a task, check `client/components/ui/*` and the relevant domain folder (`client/components/<domain>/*`) for an existing one that fits, or fits with a new prop/variant added — don't create a near-duplicate.
- The roadmap card (used in Explore, Dashboard, and Related Roadmaps per `architecture.md`) is a single component reused across all three contexts, not three separate implementations.
- Skeleton loaders mirror the exact layout of the component they're loading in place of (e.g. the roadmap card skeleton matches the roadmap card's structure).

---

## 6. Motion

Per `coding-guidelines.md` §3.3: Framer Motion for standard transitions with the `[0.22, 1, 0.36, 1]` easing, GSAP reserved for the landing page's scroll-triggered sequences. In this palette/subject, the signature motion moment is the **hero's path-and-milestone animation** — spend the animation budget there, and keep everything else (card hovers, modal opens, page transitions) quiet and consistent rather than adding movement everywhere.

---

## 7. What This Document Does Not Cover

- Component logic/data-fetching patterns → `coding-guidelines.md`
- Page-to-route mapping → `folder-structure.md`
- Streaming chat behavior → `ai-pipeline.md`