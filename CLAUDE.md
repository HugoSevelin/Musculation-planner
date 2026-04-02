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

## Architecture

This is a **Next.js 16 App Router** project bootstrapped from a shadcn/ui template. The app is in early scaffolding — only the root layout and a placeholder home page exist.

- `app/` — App Router pages and layouts. `layout.tsx` wraps everything in `ThemeProvider`.
- `components/ui/` — shadcn/ui component primitives (Radix-based, Tailwind-styled).
- `components/theme-provider.tsx` — Wraps `next-themes`; pressing `d` toggles dark/light mode globally (unless focus is in a form element).
- `lib/utils.ts` — Exports `cn()` helper (`clsx` + `tailwind-merge`).
- `hooks/` — Custom React hooks (empty, ready for additions).

**Styling**: Tailwind CSS v4 with CSS variables for theming. Base color is `neutral`. Icon library is `hugeicons` (`@hugeicons/react`).

**Path aliases**: `@/` maps to the repo root — use `@/components`, `@/lib`, `@/hooks`.
