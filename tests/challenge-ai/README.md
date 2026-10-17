# Independent challenge AI checks

Despite the historical directory name, this suite now covers deterministic challenges, learning quotas, account lifecycle, rankings, Enterprise isolation and billing transactions, as well as the legacy AI contracts. See [the current project status](../../docs/STATUS.md) and [release readiness](../../docs/RELEASE_READINESS.md).

Run `node --test tests/challenge-ai/provider-contract.test.mjs tests/challenge-ai/client-server-contract.test.mjs` from the repository root with Node 24+. These checks use a fake provider and never call Mistral.

The Firestore authorization tests require Java 21+, the root dependencies, this directory's dependencies and the server dependencies. From the repository root, run:

```sh
npm ci
npm ci --prefix functions
npm ci --prefix tests/challenge-ai
npm run functions:build
npx --yes firebase-tools@15.32.1 emulators:exec --only firestore --project demo-memstack-challenge-ai "npm --prefix tests/challenge-ai run test:rules"
npx --yes firebase-tools@15.32.1 emulators:exec --only auth --project demo-memstack "npm --prefix tests/challenge-ai run test:auth"
```

These commands match the emulator suites in `.github/workflows/pages.yml`; the verification workflow runs the Firestore suite. The test suites refuse to start without their emulator environment variables and use isolated `demo-` project IDs. They do not require production credentials. The root `npm run test:challenge-rules` currently runs only the offline provider/client contracts, despite its name; use the explicit `test:rules` command above to exercise Firestore authorization and transactions.

Coverage includes historical and structured attempt ownership, immutable answers and timestamps, one-time historical self-assessment, rejection of malformed forms, server-only feedback, private usage counters, concurrent claims of the same attempt, and simultaneous reservations of the last global quota slot. The suite also covers server learning limits/imports, permanent Premium, account deletion, rankings and organization access/progress/billing isolation. The Auth suite covers Google/password identity continuity and password reset on an emulator. Transaction tests execute production service functions against Firestore. These tests do not qualify the deployed callable HTTP transport, real Stripe configuration, email delivery or model quality.

`npm run ai:qualification` displays the offline editorial corpus without evaluating a provider. Pass an observed results JSON file to compare verdicts and missed checkpoints. See `docs/RELEASE_READINESS.md` for qualification limits, publication, rollback and outstanding sensitive recipes. The PR workflow runs the emulator suite without production credentials.
