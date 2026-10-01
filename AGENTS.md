# Repository Guidelines

## Project Structure & Module Organization

MemStack is a React, TypeScript, and Vite app. `src/main.tsx` mounts the app, `src/App.tsx` selects the current page, and `src/index.css` holds global styles. Put reusable UI in `src/components/`, static lesson content in `src/data/`, lesson flow logic in `src/lesson/`, and shared types in `src/types/`. `public/` is for assets copied unchanged into the build. `docs/PRODUCT.md` defines the MVP, while `docs/ARCHITECTURE.md` explains the planned architecture. There are no tests or Firebase files yet.

## Build, Test, and Development Commands

- `npm ci`: install the locked dependencies from `package-lock.json`.
- `npm run dev`: start Vite for local development.
- `npm run build`: type-check with TypeScript and create the production bundle in `dist/`.
- `npm run preview`: serve the built bundle locally after a successful build.

There is no `npm test` or lint script yet. Do not claim either check passed; run `npm run build` for every code change.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript, TSX, CSS, and JSON. Follow the existing TypeScript style: single quotes, no semicolons, and small functional React components. Name components and their files in PascalCase (`LessonCard.tsx`); use camelCase for functions and variables. Keep imports and UI focused; avoid creating abstraction layers for features that do not exist. No formatter or linter is configured, so preserve the surrounding style.

## Testing Guidelines

No testing framework or coverage target is configured. When adding behavior, add meaningful tests with the chosen framework and document the command in `package.json` and this guide. Keep tests near the code they verify, for example `src/components/LessonCard.test.tsx`. Until then, verify changes with `npm run build` and a brief manual check in the browser when UI changes.

## Commits & Pull Requests

The repository has no commits yet, so it has no established commit-message convention. Use short imperative subjects, such as `Add lesson shell`. A pull request should state the change, why it is needed, and how it was verified; include screenshots for visible UI changes and link a relevant issue when one exists.

## Architecture & Configuration

Keep this stage frontend-only. The lesson at `/today` is interactive and sourced from static data; Firebase Auth, Firestore, GitHub Pages deployment, and review features are planned but not implemented. Never commit secrets or local `.env` files. Before adding a backend or new service, explain the requirement it solves and update `docs/ARCHITECTURE.md`.
