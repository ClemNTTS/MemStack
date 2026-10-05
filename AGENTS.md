# Repository Guidelines

## Project Structure & Module Organization

MemStack is a React, TypeScript, and Vite app. `src/main.tsx` mounts the app, `src/App.tsx` selects the current page, and `src/index.css` holds global styles. Put reusable UI in `src/components/`, static lesson content in `src/data/`, lesson flow logic in `src/lesson/`, and shared types in `src/types/`. `public/` is for assets copied unchanged into the build. `docs/PRODUCT.md` defines the MVP, while `docs/ARCHITECTURE.md` explains the planned architecture. Review scheduling and daily queues live in `src/review/`; versioned localStorage persistence lives in `src/progress/`, both with colocated tests. Firebase adapters live in src/firebase/; src/progress/ProgressProvider.tsx coordinates Google sign-in, account caches, imports and synchronization. firestore.rules restricts access by user and validates document fields.

## Build, Test, and Development Commands

- `npm ci`: install the locked dependencies from `package-lock.json`.
- `npm run dev`: start Vite for local development.
- `npm run build`: type-check with TypeScript and create the production bundle in `dist/`.
- `npm test`: run review scheduling, daily queue, storage, and card gesture tests using the built-in Node.js runner (Node 24+).
- `npm run preview`: serve the built bundle locally after a successful build.

There is no lint script yet. Run `npm run build` for every code change and `npm test` when changing review behavior.

The active lesson library lives in `src/data/catalog/`, with its plan in `docs/CURRICULUM.md` and `docs/content/curriculum.json`. Read `docs/content/WORKFLOW.md` before editing lessons; retain stable IDs, primary sources and the inspection record. Run `npm test` for content changes. `LearningWorkspace` routes authenticated pages, including explicit `?start=lesson` or `?start=cards` actions. `catalogPlan` proposes lessons, global pending cards and optional relearning suggestions. `learningPreference` stores course and daily goal locally per account; neither is cloud synced.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript, TSX, CSS, and JSON. Follow the existing TypeScript style: single quotes, no semicolons, and small functional React components. Name components and their files in PascalCase (`LessonCard.tsx`); use camelCase for functions and variables. Keep imports and UI focused; avoid creating abstraction layers for features that do not exist. No formatter or linter is configured, so preserve the surrounding style.

## Testing Guidelines

Use the native Node.js test runner for pure review and gesture logic. Run `npm test`; tests live beside their module, e.g. `src/review/schedule.test.ts`. No coverage target is configured. Verify UI changes with a build and a brief browser check.

## Commits & Pull Requests

Existing commit subjects are short and imperative. Use short imperative subjects, such as `Add lesson shell`. A pull request should state the change, why it is needed, and how it was verified; include screenshots for visible UI changes and link a relevant issue when one exists.

## Architecture & Configuration

Keep this stage frontend-only. Thirty ordered courses use static content; Google Auth, Firestore progress synchronization and explicit local imports are implemented; deployment remains planned. Discovery has no daily cap. Reviews use renewable batches of five due cards; never bring future cards forward or automatically start another lesson. Daily goals are optional guidance. Preserve historical Docker lesson/card IDs. Google authentication and Internet access are required on every route; never allow guest or offline learning. Never commit secrets or local `.env` files. Before adding a service, explain its requirement and update `docs/ARCHITECTURE.md`.

