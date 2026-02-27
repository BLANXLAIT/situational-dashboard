# S.A.A.M. Architectural Context 
**(Situational Awareness & Analysis Monitor)**

*This document serves as the foundational memory and constraint system for future AI coding sessions.*

## 1. Project Overview
S.A.A.M. is a responsive, customizable "pane of glass" web dashboard designed to synthesize cross-domain information feeds (Geopolitics, Finance, Geology, AI/Tech).

## 2. Core Tech Stack
*   **Frontend**: React + Vite (Custom glassmorphism design system in vanilla CSS, no Tailwind).
*   **Backend**: Firebase Functions v2.
*   **Hosting**: Firebase Hosting (Project ID: `saam-dashboard-1772190712`).
*   **Data Flow**: The React frontend pulls data strictly through our Firebase Functions to avoid exposing external API keys and to manage CORS securely.

## 3. Strict Architectural Rules & Decisions

### 3.1 Backend & Functions
*   **Language**: **TypeScript only** for all Firebase Functions.
*   **Engine**: Must run on **Node.js 22** (per `functions/package.json` engines block).
*   **Modular Design**: Functions must be separated by domain (e.g., `functions/src/geology/`, `functions/src/intelligence/`). Do not bloat `index.ts`.
*   **Security (CORS)**: All HTTP `onRequest` functions must enforce strict CORS. Currently limited to `localhost:5173` and the production `.web.app` domain. *Do not allow wildcard `cors: true`.*
*   **Emulator**: Always test functions locally via the Firebase Local Emulator Suite (`firebase emulators:start`) before deploying. Vite is configured to proxy `/api` calls to port `5001`.

### 3.2 Frontend & UI Constraints
*   **Styling**: Use the existing global CSS variables defined in `index.css` (e.g., `var(--bg-glass)`, `var(--radius-xl)`).
*   **Widget Ecosystem**: All new widgets must be wrapped in the `<WidgetContainer>` component to maintain the unified sizing, glassmorphism, and header actions (like the remove button).
*   **State Management**: Dashboard layout state (active widgets) is currently persisted via `localStorage` (key: `saam_widgets`).

## 4. Immediate Roadmap (Next Steps)
1.  **Firebase App Check**: Implement reCAPTCHA Enterprise verification to lock down the Cloud Functions from non-browser invocations.
2.  **Gemini AI Parsing**: Create `functions/src/ai/geminiParser.ts` to consume feeds (like Hacker News) and output synthesized TL;DRs directly to the frontend widgets.
3.  **Firebase Auth**: Transition from `localStorage` to Firestore for saving encrypted user-specific dashboard layouts and custom AI prompts.
4.  **UI/UX Testing**: Implement automated browser-based verification (using Playwright/Puppeteer) to ensure visual<!-- CI Trigger: Project-level IAM Roles Applied -->
widget data integrity during feature additions.
