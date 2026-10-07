# Independent challenge AI checks

Run `node --test tests/challenge-ai/provider-contract.test.mjs tests/challenge-ai/client-server-contract.test.mjs` from the repository root with Node 24+. These checks use a fake provider and never call Mistral.

The Firestore authorization tests require Java and a running Firestore emulator. Install this directory's dependencies with `npm ci` and the server dependencies with `npm --prefix functions ci`. From the repository root, run `npx firebase-tools emulators:exec --only firestore --project demo-memstack-challenge-ai "npm --prefix tests/challenge-ai run test:rules"`. The test suite refuses to start without the emulator environment variable and uses isolated `demo-` project IDs.

Coverage: historical and structured attempt ownership, immutable answers and timestamps, one-time self-assessment, rejection of malformed forms, server-only feedback, private usage counters, concurrent claims of the same attempt, and simultaneous reservations of the last global quota slot. The transaction tests execute the same claim function as production against Firestore, using a separate emulator project. These tests do not cover the deployed callable HTTP transport or model quality.
