# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

S.A.A.M. (Situational Awareness & Analysis Monitor) — a real-time dashboard that synthesizes cross-domain data feeds (geology, space weather, tech news, macro economics, global disasters) through Firebase Cloud Functions, with an AI analyst powered by Gemini 2.0 Flash.

**Firebase Project ID:** `saam-dashboard-1772190712`
**Production URL:** `https://saam-dashboard-1772190712.web.app`

## Commands

```bash
# Frontend dev server (proxies /api/* to functions emulator on port 5001)
npm run dev

# Build frontend (outputs to dist/)
npm run build

# Lint
npm run lint

# Unit tests (Vitest, JSDOM)
npm test

# E2E tests (Playwright, needs dev server running)
npm run test:ui

# Backend: build functions
cd functions && npm run build

# Backend: run functions tests
cd functions && npm test

# Start functions emulator (builds first)
cd functions && npm run serve

# Deploy (CI does this, but manual if needed)
firebase deploy --project saam-dashboard-1772190712
```

## Architecture

**Frontend:** React 19 + Vite, vanilla CSS with glassmorphism design system (no Tailwind). Two views: Dashboard (widget grid) and DataSourcesPage.

**Backend:** Firebase Cloud Functions v2 (TypeScript, Node 22). Each data domain has its own module under `functions/src/` (geology, intelligence, finance, disasters, analyst). All exported from `functions/src/index.ts`.

**Data flow:** Frontend widgets call `/api/*` endpoints → Firebase Hosting rewrites (in `firebase.json`) route to Cloud Functions → Functions fetch from external APIs (USGS, NOAA, Hacker News, GDACS, FRED, Gemini).

**Secrets:** FRED_API_KEY and GEMINI_API_KEY stored in Google Cloud Secret Manager, referenced via `secrets` config in function definitions.

## Architectural Rules

- **TypeScript only** for all Firebase Functions
- **Node 22** runtime (enforced in `functions/package.json`)
- **Strict CORS** on all HTTP functions — only `localhost:5173` and `*.web.app`. Never use wildcard `cors: true`
- **Modular functions** — organized by domain directory, don't bloat `index.ts`
- All widgets must use `<WidgetContainer>` wrapper component
- Use existing CSS variables from `src/index.css` (e.g., `var(--bg-glass)`, `var(--radius-xl)`)
- Widget state persisted in localStorage (key: `saam_widgets`)
- Frontend fetches data only through our Firebase Functions (never directly to external APIs)

## Key Files

- `firebase.json` — API route rewrites mapping `/api/*` paths to function names
- `functions/src/index.ts` — function exports with CORS config
- `functions/src/analyst/gemini.ts` — Gemini narrative generation
- `functions/src/analyst/consolidator.ts` — aggregates all sources for AI context
- `src/components/Dashboard.jsx` — main widget grid layout
- `src/components/widgets/WidgetContainer.jsx` — shared widget wrapper
- `src/index.css` — global design tokens and glassmorphism system
- `vite.config.js` — dev server proxy config (port 5001)

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`): push to `main` → test → deploy. Uses OIDC/WIF authentication to GCP (service account: `github-ci@github-ci-blanxlait.iam.gserviceaccount.com`).

**Never push directly to `main`.** Always create a branch and open a PR, even for docs-only changes.
