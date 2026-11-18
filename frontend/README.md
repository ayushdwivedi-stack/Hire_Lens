# Hirelens — Frontend

Next.js (App Router, TypeScript, Tailwind) frontend for Hirelens, an AI resume ↔ job
description matcher. This talks only to the existing FastAPI backend — it never calls
Ollama directly.

```
Browser → Next.js frontend → FastAPI backend → Ollama (Qwen3) → FastAPI → Browser
```

## 1. Install

From `Hirelens/frontend`:

```bash
npm install
```

## 2. Configure the backend URL

```bash
cp .env.local.example .env.local
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

This is the only environment variable the frontend reads. Nothing else — no API keys,
no model credentials — is ever exposed to the browser.

## 3. Run

Start the FastAPI backend first (separately, on `127.0.0.1:8000` by default), then:

```bash
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm run start   # production build
```

## Project structure

```
src/
  app/
    layout.tsx            Root layout, fonts, metadata
    globals.css            Base styles, focus states, reduced-motion handling
    page.tsx                Landing page
    analyze/page.tsx        Resume + job description workspace
    results/page.tsx        Analysis results

  components/
    layout/                 Header, Footer
    landing/                Hero, HowItWorks, WhatWeAnalyze, PrivacyNote
    analyzer/                ResumeDropzone, JobDescriptionInput, AnalysisProgress
    results/                 ScorePanel, SectionReport, KeywordGroup, AtsFlagsList,
                              QuickWins, ResultsEmptyState
    ui/                     Button, Chip, Callout, ProgressStages — generic primitives

  lib/
    api.ts                  Centralized fetch client for the FastAPI backend
    types.ts                 Types mirroring the backend's Pydantic response models
    resultsStore.ts          sessionStorage handoff between /analyze and /results
    utils.ts                 Small formatting/class-name helpers
```

## Backend integration

All requests go through `src/lib/api.ts`:

- `checkHealth()` — `GET /api/health`, used on the analyze page to surface a
  "backend unavailable" notice before the user submits anything.
- `analyzeResumeFile(file, jobDescription)` — `POST /api/analyze`
  (`multipart/form-data`, fields `resume_file` + `job_description`). This is what the
  analyzer page uses.
- `analyzeResumeText(payload)` — `POST /api/analyze-text` (JSON `resume_text` +
  `job_description`), included for completeness / future text-paste flows, though the
  current UI only exercises the file upload path.

Every failure is normalized into a single `ApiError` with a `kind`
(`network` | `timeout` | `validation` | `server` | `unknown`) and a message that's
already safe to show a non-technical user — e.g. "Couldn't connect to Hirelens.
Please make sure the backend is running and try again." No stack traces or Axios/fetch
internals ever reach the UI.

`sections` in the analysis response is treated as a partial object per the spec — the
results page only renders whichever of `summary` / `experience` / `skills` /
`education` are actually present, in a fixed display order.

Two data-shape decisions worth knowing about, since the backend contract doesn't
specify them:
- **ATS flags** have no severity field, so they're all rendered with one consistent
  warning treatment rather than invented severity levels.
- **Progress stages** during analysis are shown on a timed sequence (the four stages
  from the brief), since the backend returns a single response rather than streaming
  intermediate steps. If the backend is later extended to emit progress events, swap
  the `setInterval` in `analyze/page.tsx` for real events with no other changes needed.

## How navigation/state works

There's no global state library. `/analyze` calls the backend, and on success stores
the parsed `AnalysisResult` in `sessionStorage` (`src/lib/resultsStore.ts`) before
navigating to `/results`. `/results` reads it back on mount. This is enough to survive
the client-side navigation *and* a manual refresh of `/results`, while automatically
clearing when the tab closes — resume-derived content isn't kept longer than the
session needs it. If `/results` is opened with nothing stored (direct link, expired
session), it shows an explicit empty state pointing back to `/analyze` rather than a
blank or broken page.

The resume **file itself** is never stored anywhere other than as the in-memory
`File` object on the analyze page for the duration of the request — it's not persisted
to `sessionStorage`, `localStorage`, or sent anywhere but the one `/api/analyze` call.

## Design notes

The visual direction is intentionally editorial rather than "AI SaaS": a warm-neutral
paper background, a serif for headings paired with Inter for UI text, hairline
borders/dividers instead of card shadows, and a single muted teal accent reserved for
the primary action and score highlights. Score-band colors (good/warn/bad) are the
only other color signal, used consistently across the score dial, section scores,
keyword chips, and ATS flags.

## Accessibility

- All interactive elements are real `<button>`/`<label>`/`<input>` elements with
  visible `:focus-visible` outlines (see `globals.css`).
- The resume dropzone's drag-and-drop has a full keyboard/file-picker fallback: the
  drop area is a `<label>` wrapping a real (visually hidden, not `display: none`) file
  input, so Tab + Enter/Space opens the native file picker.
- Loading and error states use `role="status"` / `role="alert"` with `aria-live`
  where appropriate so screen readers announce progress and failures.
- `prefers-reduced-motion` is respected globally; the only non-essential motion is the
  progress-stage pulse, which is disabled under reduced motion.

## Known limits / next steps

- No automated tests are included; the brief scoped this as a frontend build against
  an existing backend contract.
- `analyzeResumeText` is wired up but not yet exposed in the UI — the brief specifies
  a PDF upload flow only. Add a "paste resume text" toggle on `/analyze` if that path
  is needed later.
