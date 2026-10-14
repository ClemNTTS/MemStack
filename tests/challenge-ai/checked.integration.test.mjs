import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { submitCheckedChallenge } from '../../functions/src/challengeChecks.mjs'

const require = createRequire(new URL('../../functions/package.json', import.meta.url))
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
let app, db
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required; production access prohibited')
  app = initializeApp({ projectId: 'demo-memstack-checked' }, 'checked-tests')
  db = getFirestore(app)
})
after(async () => { if (app) await deleteApp(app) })

test('real transaction persists one immutable checked result without an AI invitation or quota', async () => {
  const uid = `checked-${Date.now()}`
  await db.doc(`users/${uid}/lessons/one`).set({ completedAt: 'date' })
  await db.doc(`users/${uid}/lessons/two`).set({ completedAt: 'date' })
  const challenge = { id: 'exam', challengeVersion: 3, rubricVersion: 2,
    questions: ['q1', 'q2', 'q3'].map((id, checkpointIndex) => ({ id, checkpointIndex, options: [{ id: 'a' }, { id: 'b' }] })) }
  const key = { id: 'exam', challengeVersion: 3, rubricVersion: 2, questions: challenge.questions.map(question => ({ id: question.id, correctOptionIds: ['b'] })) }
  const args = { db, uid, data: { attemptId: 'checked', challengeId: 'exam', challengeVersion: 3, selections: { q1: 'b', q2: 'b', q3: 'b' } },
    questions: [challenge], answerKeys: [key], dossiers: [{ id: 'exam', version: 2, courseId: 'course', lessonIds: ['one'] }],
    courses: [{ id: 'course', theme: 'Tests', lessons: [{ id: 'one' }, { id: 'two' }] }], now: Date.now(), timestamp: Timestamp.now() }
  const [first, second] = await Promise.all([submitCheckedChallenge(args), submitCheckedChallenge(args)])
  assert.deepEqual(first, second)
  assert.equal(first.result.verdict, 'validated')
  assert.equal((await db.doc(`users/${uid}/writeBudgets/attempts`).get()).data().count, 1)
  assert.equal((await db.doc(`users/${uid}/challengeAiUsage/2026-10-13`).get()).exists, false)
  await assert.rejects(submitCheckedChallenge({ ...args, data: { ...args.data, selections: { q1: 'a', q2: 'b', q3: 'b' } } }), { code: 'already-exists' })
  assert.equal((await db.doc(`users/${uid}/challengeAttempts/checked`).get()).data().result.verdict, 'validated')
})
