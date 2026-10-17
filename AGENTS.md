# Repository Guidelines

## Project Structure & Module Organization

MemStack is a React, TypeScript, and Vite app. `src/main.tsx` mounts the app, `src/App.tsx` selects public pages or the authenticated Development/Enterprise workspace, and `src/index.css` holds global styles. Put reusable UI in `src/components/`, static lesson content in `src/data/`, lesson flow logic in `src/lesson/`, and shared types in `src/types/`. `public/` contains assets copied unchanged into the build. `docs/PRODUCT.md` describes the product; `docs/ARCHITECTURE.md` describes the implemented architecture and configuration boundaries.

Review scheduling and queues live in `src/review/`; account caches, synchronization and preferences live in `src/progress/`, with colocated tests. Firebase browser adapters live in `src/firebase/`. `ProgressProvider.tsx` coordinates authenticated accounts, account caches, explicit imports and synchronization. Auth supports Google and verified email/password accounts. `firestore.rules` validates owner access and schemas; privileged operations live in Node 24 Firebase Functions under `functions/`. Shared public questionnaires and server answer keys live in `shared/`; never import answer keys into the frontend. Enterprise UI lives in `src/enterprise/`, with separate organization-scoped persistence and backend modules.

## Build, Test, and Development Commands

- `npm ci`: install locked root dependencies (install `functions/` and `tests/challenge-ai/` dependencies separately when needed).
- `npm run dev`: start Vite locally on port 3000.
- `npm run build`: type-check TypeScript and create the frontend bundle in `dist/`.
- `npm test`: type-check test sources and run the native Node.js suite, including review, content, challenges, Enterprise, reports and Functions unit tests (Node 24+).
- `npm run functions:build` / `npm run functions:test`: prepare the server catalog, check server syntax and run server unit tests.
- `npm run preview`: serve a successful frontend build locally.

There is no lint script. Run `npm run build` for every code change; run `npm test` for review, content or shared business behavior changes. Run Functions build/tests for server changes. For authorization, quota, billing-access or account-lifecycle changes, also run the applicable emulator rules/transaction tests. The exact isolated Firestore and Auth commands are maintained in `.github/workflows/verify.yml` and `.github/workflows/pages.yml`; `npm run test:challenge-rules` alone runs contract tests, not the emulator integration suite.

The active lesson library lives in `src/data/catalog/`, with its plan in `docs/CURRICULUM.md` and `docs/content/curriculum.json`. Read `docs/content/WORKFLOW.md` before editing lessons; retain stable IDs, primary sources and the inspection record. Preserve historical Docker lesson/card IDs. `LearningWorkspace` routes authenticated Development pages, including explicit `?start=lesson` or `?start=cards` actions. `catalogPlan` proposes lessons, pending cards and optional relearning suggestions. Preferences at `users/{uid}/settings/learning` use Firestore transactions: cloud settings take precedence; legacy local settings migrate only when the remote document is absent. Confirm saves only after server acknowledgement.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript, TSX, CSS, and JSON. Follow the existing TypeScript style: single quotes, no semicolons, and small functional React components. Name components and files in PascalCase (`LessonCard.tsx`); use camelCase for functions and variables. Keep imports and UI focused; avoid abstraction layers for features that do not exist. No formatter or linter is configured, so preserve surrounding style.

## Testing Guidelines

Use the native Node.js test runner for pure business and gesture logic. Tests live beside their module, e.g. `src/review/schedule.test.ts`. No coverage target is configured. Verify UI changes with a build and a brief browser check. A passing build does not confirm deployed Firebase parameters, secrets, App Check settings, Stripe mode or production behavior.

## Commits & Pull Requests

Use short imperative subjects, such as `Add lesson shell`. A pull request should state the change, why it is needed and how it was verified; include screenshots for visible UI changes and link a relevant issue when one exists.

## Architecture & Configuration

Learning content remains static and versioned in Git. The frontend is hosted on GitHub Pages; Firebase Auth, Firestore, App Check and Functions handle identity, persistence and privileged actions. Functions now cover learning quotas/imports, deterministic challenges, rankings, administration, account export/deletion, subscriptions and Enterprise operations. Stripe Checkout, its portal and signed webhooks handle personal and organization subscriptions. Never grant access from a payment return URL. Keep Stripe, Mistral and Firestore server credentials outside browser code and all `VITE_` variables. Never commit secrets or local `.env` files.

Public routes include the signed-out landing page `/`, `/discover`, `/business`, `/login` and legal pages (`/legal`, `/privacy`, `/terms`, `/enterprise-data`). Learning requires an authenticated eligible account, Internet and successful synchronization; do not enable guest or offline learning. Google and verified email/password are supported for members; privileged administration and the historical AI service retain their specific Google/claim checks. No service worker enables offline learning.

New lesson completions and card answers always use `commitLearningAction`. `VITE_SERVER_LEARNING_ENABLED` selects cloud-first reading and server imports rather than legacy cache merging/synchronization; the Firestore switch `_configuration/learningAccess.enabled` closes direct client progress writes. Coordinate both during rollout; see `docs/SUBSCRIPTIONS.md`. The callable allows free accounts to complete one new lesson and five due-card reviews per day in `Europe/Paris`; introducing a lesson's new cards does not consume the review allowance. Premium removes these learning caps. The frontend always requires Premium for challenges; the server enforces Premium on new attempts when its learning-access switch is active. Daily goals remain optional guidance. Reviews use explicit batches of up to five due cards; never bring future cards forward or automatically start another lesson. Server dates, transactions and idempotent receipts enforce allocations; client flags alone do not secure access.

Current challenges use 36 versioned dossiers with five questions each, corrected deterministically by `submitDeterministicChallenge`. Questionnaire v4 and rubric v3 use immutable attempt schema v3; four of five correct answers validate a challenge. Public questions are in `shared/challengeQuestions.json`; answer keys are packaged only with Functions. Preserve archived versions and IDs. Keep attempts separate from card scheduling and lesson completion; await the server write before displaying the correction. Answers, server dates and historical self-assessments are immutable; retry with a new attempt. Never execute learner code. Read `docs/content/CHALLENGES.md` before changing challenge content.

The historical Mistral analysis callable remains opt-in and disabled by default, with Google Auth, App Check, invitations, server quotas and deduplication. It is not the correction path for current questionnaires and must not block their UI. Analyses at `users/{uid}/challengeAnalyses/{attemptId}` are server-write-only. Read `docs/CHALLENGE_AI.md` before modifying this service; retain qualification limits rather than presenting experimental feedback as qualified.

Enterprise learning is isolated under `organizations/{organizationId}/learners/{uid}` with organization membership, ranking and billing managed server-side; `users/{uid}/enterpriseMemberships` indexes memberships. Do not mix personal and organization progression, grants, quotas or rankings. Managers may see activity summaries, not individual answers. See `docs/ENTERPRISE_BACKEND.md` and `docs/ENTERPRISE_BILLING.md` for access, invitations and seat synchronization.

Content reports live in `src/reports/` and `src/firebase/contentReports.ts`; members create/read their own immutable reports. The Node worker in `scripts/content-reports/` uses Mistral and Firestore server credentials only in GitHub Actions or local Node; never log provider responses. `.github/workflows/content-reports.yml` is opt-in; see `docs/content/REPORTS.md`. Agent proposals may change only existing text through `src/data/catalog/corrections.json`, preserving IDs and transitions. Tests and build must pass before a draft PR; a person reviews and merges. `npm run reports:check` makes no network call. `npm run reports:process` processes real reports and requires configured secrets.

Firebase Functions require Blaze. Obtain explicit owner authorization before billing changes or deployment; a build is not deployment authorization. Before adding a service, explain its requirement and update `docs/ARCHITECTURE.md`. Defaults and repository configuration do not establish the current state of deployed services; use dated qualification records and explicit environment checks.
