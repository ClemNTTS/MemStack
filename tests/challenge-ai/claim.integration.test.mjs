import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { after, before, test } from 'node:test'
import { claimAnalysis } from '../../functions/src/claim.mjs'
const require = createRequire(new URL('../../functions/package.json', import.meta.url))
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
let app, db
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator is required; production access is prohibited')
  app = initializeApp({ projectId: 'demo-memstack-challenge-claim' }, 'challenge-claim-tests')
  db = getFirestore(app)
  await db.recursiveDelete(db.collection('users'))
  await db.recursiveDelete(db.collection('_challengeAiUsage'))
})
after(async () => { if (app) await deleteApp(app) })
const now = Date.parse('2026-10-07T12:00:00Z')
const day = '2026-10-07'
const dossier = { id: 'docker-images-diagnostic', version: 2, rubricVersion: 1, courseId: 'course', lessonIds: ['one'] }
const courses = [{ id: 'course', theme: 'Tests', lessons: [{ id: 'one' }, { id: 'two' }, { id: 'three' }] }]
const config = { enabled: true, invited: ['alice', 'bob'], model: 'version-pinned', hasKey: true, limits: { user: 5, global: 25, tokens: 400000 } }
const args = (uid, attemptId, patch = {}) => ({ db, uid, attemptId, now, config, dossiers: [dossier], courses, timestamp: Timestamp.fromMillis(now), ...patch })
async function seed(uid, id) {
  await db.doc(`users/${uid}/lessons/one`).set({ completedAt: 'date' })
  await db.doc(`users/${uid}/lessons/two`).set({ completedAt: 'date' })
  await db.doc(`users/${uid}/settings/challengeAccess`).set({ aiEnabled: true })
  await db.doc(`users/${uid}/challengeAttempts/${id}`).set({ version: 2, challengeVersion: 2, challengeId: dossier.id,
    observations: 'Image ancienne', actions: 'Reconstruire', answer: 'Image ancienne\n\nReconstruire', submittedAt: Timestamp.fromMillis(now) })
}

test('missing prerequisite rejects analysis without quota or result writes', async () => {
  const id = `prerequisite-${Date.now()}`
  await seed('prerequisite-user', id)
  await db.doc('users/prerequisite-user/lessons/one').delete()
  await assert.rejects(claimAnalysis(args('prerequisite-user', id, { config: { ...config, invited: ['prerequisite-user'] } })), error => error.code === 'failed-precondition')
  assert.equal((await db.doc(`users/prerequisite-user/challengeAiUsage/${day}`).get()).exists, false)
  assert.equal((await db.doc(`users/prerequisite-user/challengeAnalyses/${id}`).get()).exists, false)
})

test('concurrent calls for one attempt reserve once, then expiry never opens a second provider call', async () => {
  const id = `concurrent-${Date.now()}`
  await seed('alice', id)
  const before = (await db.doc(`_challengeAiUsage/${day}`).get()).data()?.requests ?? 0
  const claims = await Promise.all([claimAnalysis(args('alice', id)), claimAnalysis(args('alice', id))])
  assert.equal(claims.filter(claim => claim.start).length, 1)
  assert.equal((await db.doc(`_challengeAiUsage/${day}`).get()).data().requests, before + 1)
  const expired = await claimAnalysis(args('alice', id, { now: now + 120001 }))
  assert.equal(expired.start, undefined)
  assert.equal(expired.result.status, 'needs_review')
  assert.equal((await db.doc(`_challengeAiUsage/${day}`).get()).data().requests, before + 1)
})

test('concurrent different users cannot exceed the last global slot', async () => {
  const id = `quota-${Date.now()}`
  await seed('alice', id)
  await seed('bob', id)
  await db.doc(`_challengeAiUsage/${day}`).set({ requests: 24, reservedTokens: 0 })
  const results = await Promise.allSettled([claimAnalysis(args('alice', id)), claimAnalysis(args('bob', id))])
  assert.equal(results.filter(result => result.status === 'fulfilled' && result.value.start).length, 1)
  const rejected = results.find(result => result.status === 'rejected')
  assert.equal(rejected.reason.code, 'resource-exhausted')
  assert.equal((await db.doc(`_challengeAiUsage/${day}`).get()).data().requests, 25)
})

test('owner cannot claim another account attempt or consume quota when not invited', async () => {
  const id = `owner-${Date.now()}`
  await seed('alice', id)
  await db.doc('users/bob/settings/challengeAccess').set({ aiEnabled: true })
  await assert.rejects(claimAnalysis(args('bob', id)), error => error.code === 'failed-precondition')
  await assert.rejects(claimAnalysis(args('eve', id)), error => error.code === 'permission-denied')
  assert.equal((await db.doc(`users/bob/challengeAnalyses/${id}`).get()).exists, false)
})
