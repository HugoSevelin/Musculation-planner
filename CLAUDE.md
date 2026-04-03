# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server with Turbopack
bun build        # Production build
bun lint         # ESLint
bun format       # Prettier (writes in place)
bun typecheck    # TypeScript type check (no emit)
```

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component-name>
```

Components land in `components/ui/`. Import via `@/components/ui/<name>`.

**RULE: Always use shadcn/ui components** for any UI element that has a shadcn equivalent (buttons, inputs, dialogs, cards, selects, badges, etc.). Never build these primitives from scratch with raw HTML + Tailwind when a shadcn component exists. Install the component first if it isn't already present in `components/ui/`.

## Project Goal

Production-grade workout planner — **Garmin meets military logbook**. Dense, utilitarian, zero decoration. Targets serious athletes, not beginners.

## Core Features

1. **Program Builder** — Create training programs (PPL, Upper/Lower, etc.), define days/week, drag & drop to reorder days.
2. **Workout Session View** — Live set logging (weight × reps × checkbox), searchable exercise picker, rest timer with countdown ring (60/90/120/180s), "Finish Workout" saves session.
3. **Progressive Overload Tracker** — Per exercise: last session performance, trend indicator (↑↓→), auto-suggested next target (+2.5kg or +1 rep).
4. **History & Stats** — GitHub-style calendar heatmap, per-exercise history table + sparkline, weekly volume by muscle group (bar chart), PRs per exercise.
5. **Body Metrics** — Log weight, body fat %, measurements (chest/waist/arms); trend chart over time.

## UX Flow

Mobile-first, bottom tab bar: **[Today] [Program] [History] [Stats] [Body]**

- On launch: show today's scheduled workout (or "Rest Day" if none).
- In-progress session persisted in localStorage.

## Data Model (localStorage keys)

| Key | Content |
|---|---|
| `programs` | Array of program objects (days, exercises per day) |
| `sessions` | Completed workout sessions with timestamp + duration |
| `exercises` | Master exercise library (name, muscle group, compound/isolation) |
| `metrics` | Body measurements over time |
| `settings` | Rest timer default, units (kg/lbs) |

## Tech Stack

- **Next.js 16 App Router** — all interactive components need `"use client"`.
- **Recharts** — all graphs (sparklines, bar charts, area charts).
- **lucide-react** — icons.
- **@hello-pangea/dnd** — drag & drop for program day reordering (React 18+ compatible fork of react-beautiful-dnd).
- **localStorage** — sole persistence layer, no backend.
- **Tailwind CSS v4** with CSS variables. Path aliases: `@/` = repo root.

## Aesthetic

- Background `#0a0a0a`, text `#e8e8e0`, red accent `#e03030` (CTAs, PRs, destructive).
- Monospace font (`font-mono`) for all numbers/data; sans-serif for labels.
- **No** rounded cards, gradients, soft shadows, or pastel colors.
- Grain texture on `body` via CSS `background-image: url("data:image/svg+xml,...")`.
- Borders use `1px solid` lines, not shadows, to define sections.

## Architecture

```
app/
  page.tsx          # Client shell: tab state, localStorage init
  layout.tsx        # ThemeProvider (force dark)
  globals.css       # CSS vars overridden to dark theme, grain texture

components/workout/
  TabBar.tsx        # Bottom nav
  TodayView.tsx     # Today's scheduled day + start/resume session
  WorkoutSession.tsx # Live logging: sets, rest timer, finish
  RestTimer.tsx     # SVG countdown ring, auto-starts on set complete
  ExercisePicker.tsx # Searchable modal over exercise library
  ProgressBadge.tsx  # ↑↓→ trend + suggested next weight/reps
  ProgramBuilder.tsx # CRUD programs + drag-and-drop day order
  HistoryView.tsx    # Calendar heatmap + session list
  StatsView.tsx      # Charts: volume by muscle, PRs, exercise sparklines
  BodyView.tsx       # Body metrics form + trend chart

lib/
  types.ts          # All shared TypeScript interfaces
  storage.ts        # Typed localStorage get/set helpers + initial seed data
  exercises.ts      # Default exercise library (~50 exercises)
  utils.ts          # cn() helper
```

Key design rules across components:
- Every component that reads localStorage must be `"use client"` and guard against SSR (`typeof window !== "undefined"`).
- `storage.ts` is the single source of truth for reading/writing — no component accesses `localStorage` directly.
- Charts always rendered inside a `<ResponsiveContainer>` with explicit height.
