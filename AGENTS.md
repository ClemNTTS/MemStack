# Repository Guidelines

## Project Structure & Module Organization

MemStack is a React, TypeScript, and Vite app. `src/main.tsx` mounts the app, `src/App.tsx` selects the current page, and `src/index.css` holds global styles. Put reusable UI in `src/components/`, static lesson content in `src/data/`, lesson flow logic in `src/lesson/`, and shared types in `src/types/`. `public/` is for assets copied unchanged into the build. `docs/PRODUCT.md` defines the MVP, while `docs/ARCHITECTURE.md` explains the planned architecture. Review scheduling and daily queues live in `src/review/`; versioned localStorage persistence lives in `src/progress/`, both with colocated tests. There are no Firebase files yet.

## Build, Test, and Development Commands

- `npm ci`: install the locked dependencies from `package-lock.json`.
- `npm run dev`: start Vite for local development.
- `npm run build`: type-check with TypeScript and create the production bundle in `dist/`.
- `npm test`: run review scheduling, daily queue, storage, and card gesture tests using the built-in Node.js runner (Node 24+).
- `npm run preview`: serve the built bundle locally after a successful build.

There is no lint script yet. Run `npm run build` for every code change and `npm test` when changing review behavior.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript, TSX, CSS, and JSON. Follow the existing TypeScript style: single quotes, no semicolons, and small functional React components. Name components and their files in PascalCase (`LessonCard.tsx`); use camelCase for functions and variables. Keep imports and UI focused; avoid creating abstraction layers for features that do not exist. No formatter or linter is configured, so preserve the surrounding style.

## Testing Guidelines

Use the native Node.js test runner for pure review and gesture logic. Run `npm test`; tests live beside their module, e.g. `src/review/schedule.test.ts`. No coverage target is configured. Verify UI changes with a build and a brief browser check.

## Commits & Pull Requests

Existing commit subjects are short and imperative. Use short imperative subjects, such as `Add lesson shell`. A pull request should state the change, why it is needed, and how it was verified; include screenshots for visible UI changes and link a relevant issue when one exists.

## Architecture & Configuration

Keep this stage frontend-only. The lesson at `/today` is interactive and sourced from static data; Firebase Auth, Firestore, and GitHub Pages deployment are planned but not implemented. Binary recall, daily review queues and browser-local progress are implemented. Never commit secrets or local `.env` files. Before adding a backend or new service, explain the requirement it solves and update `docs/ARCHITECTURE.md`.

