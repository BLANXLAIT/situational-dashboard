# S.A.A.M.

**Situational Awareness & Analysis Monitor**

A real-time dashboard that synthesizes cross-domain data feeds — geology, space weather, tech news, macro economics, global disasters, and public health — through Firebase Cloud Functions, with an AI analyst powered by Gemini 2.0 Flash.

[![Deploy to Firebase](https://github.com/BLANXLAIT/situational-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/BLANXLAIT/situational-dashboard/actions/workflows/deploy.yml)

## Tech Stack

- **Frontend:** React 19, Vite, vanilla CSS (glassmorphism design system)
- **Backend:** Firebase Cloud Functions v2 (TypeScript, Node 22)
- **AI:** Gemini 2.0 Flash for situational narrative generation
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions with OIDC/WIF authentication to GCP

## Local Development

### Prerequisites

- Node.js 22+
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

```bash
# Install frontend dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..
```

### API Keys

Create `functions/.env` with:

```
FRED_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

- **FRED_API_KEY** — [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html) for macro economic data
- **GEMINI_API_KEY** — [Google AI Studio](https://aistudio.google.com/apikey) for AI analyst narratives

Without keys, the geology, space weather, intelligence, disasters, globe, and health widgets still work.

### Running

Start two terminals:

```bash
# Terminal 1 — Functions emulator
cd functions && npm run serve

# Terminal 2 — Frontend dev server (proxies /api/* to emulator on port 5001)
npm run dev
```

### Testing

```bash
# Frontend unit tests (Vitest)
npm test

# Functions tests
cd functions && npm test

# E2E tests (requires dev server running)
npm run test:ui

# Lint
npm run lint
```

## Architecture

```
Browser → React SPA → /api/* → Firebase Hosting rewrites → Cloud Functions → External APIs
```

### Data Domains

Each domain is a separate module under `functions/src/`:

| Domain | Endpoint | Source |
|--------|----------|--------|
| Geology | `/api/alerts/geology` | USGS |
| Space Weather | `/api/alerts/space` | NOAA SWPC |
| Intelligence | `/api/alerts/intelligence` | Hacker News |
| Disasters | `/api/alerts/gdacs` | GDACS |
| Macro Economics | `/api/macro` | FRED |
| Commodities | `/api/commodities` | FRED |
| Health | `/api/health/alerts`, `/api/health/influenza` | WHO, CDC |
| Globe Events | `/api/globe/events` | Aggregated |
| AI Analyst | `/api/analyst/narrative` | Gemini 2.0 Flash |

The AI analyst consolidates data from all domains to generate a situational narrative.

## Deployment

Push to `main` triggers the GitHub Actions workflow which:

1. Runs frontend and functions tests
2. Authenticates via OIDC/WIF (no static credentials)
3. Detects changed paths (`src/**` → hosting, `functions/**` → functions)
4. Builds and deploys only what changed
