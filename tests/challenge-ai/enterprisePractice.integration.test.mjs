import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { assessEnterprisePractice, practiceVersion } from '../../functions/src/enterprisePractice.mjs'

const require = createRequire(new URL('../../functions/package.json', import.meta.url))
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
let app, db, environment, sequence = 0
const now = Date.parse('2026-10-19T22:30:00Z') // Already October 20 in Paris.
const day = '2026-10-20'
const catalog = { foundationLessonIds: ['ent-first'], lessons: [{ id: 'ent-first' }, { id: 'ent-next', prerequisiteLessonIds: ['ent-first'] }] }
const practice = { scenario: 'Deux rendez-vous possibles pour un client.', task: 'Écris ton prompt.', checklist: ['Deux choix'], example: 'Propose mardi ou jeudi.' }
const practices = { 'ent-first': practice, 'ent-next': practice }
const rubric = { essential: ['Propose les deux choix'], optional: ['Une formule de politesse'], hints: ['Propose les deux choix du cas.'] }
const rubrics = { version: 1, lessons: { 'ent-first': rubric, 'ent-next': rubric } }
const feedback = { status: 'good', message: 'Tes deux créneaux sont clairs.', strengths: ['Les deux choix sont présents.'], nextStep: '' }
const config = { enabled: true, hasKey: true, model: 'mistral-small-2506' }
const identity = uid => ({ uid, token: { firebase: { sign_in_provider: 'google.com' } } })
const account = { email: 'fictional@example.com', emailVerified: true, disabled: false }

before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator required')
  app = initializeApp({ projectId: 'demo-memstack-practice' }, 'enterprise-practice-tests')
  db = getFirestore(app)
  environment = await initializeTestEnvironment({ projectId: 'demo-memstack-practice', firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') } })
})
after(async () => { if (environment) await environment.cleanup(); if (app) await deleteApp(app) })

async function fixture() {
  const suffix = ++sequence
  const uid = `practice-member-${suffix}`, organizationId = `practice-org-${suffix}`
  const base = `organizations/${organizationId}/learners/${uid}`
  await db.doc(`organizations/${organizationId}`).set({ enabled: true, offer: 'managed-pilot' })
  await db.doc(`organizations/${organizationId}/members/${uid}`).set({ active: true, role: 'learner' })
  await db.doc(`_enterprisePracticeUsage/${day}`).set({ requests: 0, reservedTokens: 0 })
  const data = { organizationId, lessonId: 'ent-first', answer: 'Propose mardi ou jeudi au client.', practiceVersion: practiceVersion(practice) }
  const context = { db, auth: identity(uid), lookup: async () => account, catalog, practices, rubrics, config, data, now, clock: () => now + 1000, evaluate: async () => feedback }
  return { uid, organizationId, base, data, context, submit: patch => assessEnterprisePractice({ ...context, ...patch }) }
}

test('transaction deduplicates concurrent requests, counts Paris day and stores no learner answer', async () => {
  const f = await fixture()
  let calls = 0, finish
  const pending = f.submit({ evaluate: async () => { calls++; return await new Promise(resolve => { finish = resolve }) } })
  while (!finish) await new Promise(resolve => setTimeout(resolve, 10))
  await assert.rejects(f.submit(), { code: 'aborted' })
  finish(feedback)
  assert.deepEqual(await pending, feedback)
  assert.deepEqual(await f.submit({ evaluate: async () => { throw new Error('Cache should avoid provider') } }), feedback)
  assert.equal(calls, 1)
  assert.deepEqual((await db.doc(`${f.base}/limits/practice-${day}`).get()).data(), { requests: 1 })
  assert.deepEqual((await db.doc(`_enterprisePracticeUsage/${day}`).get()).data(), { requests: 1, reservedTokens: 32000 })
  const receipts = await db.collection(`${f.base}/practiceFeedback`).get()
  assert.equal(receipts.size, 1)
  const receipt = receipts.docs[0].data()
  assert.equal(receipt.status, 'completed')
  assert.equal(receipt.model, config.model)
  assert.equal(receipt.rubricVersion.length, 64)
  assert.equal(JSON.stringify(receipt).includes(f.data.answer), false)
})

test('access, current account, trusted content and prerequisite failures never reserve or call provider', async () => {
  const f = await fixture()
  let calls = 0
  const evaluate = async () => { calls++; return feedback }
  for (const patch of [
    { auth: null },
    { lookup: async () => ({ ...account, disabled: true }) },
    { lookup: async () => ({ ...account, emailVerified: false }) },
    { data: { ...f.data, organizationId: 'other-org' } },
    { data: { ...f.data, uid: 'other' } },
    { data: { ...f.data, practiceVersion: 'old' } },
    { data: { ...f.data, lessonId: 'ent-next' } },
    { rubrics: { version: 1, lessons: {} } },
    { config: { ...config, enabled: false } },
    { config: { ...config, enabled: 'true' } },
    { config: { ...config, hasKey: false } },
    { config: { ...config, model: 'mistral-small' } },
  ]) await assert.rejects(f.submit({ evaluate, ...patch }))
  for (const completedAt of ['invalid', new Date(now + 86400000).toISOString()]) {
    await db.doc(`${f.base}/lessons/ent-first`).set({ completedAt })
    await assert.rejects(f.submit({ evaluate, data: { ...f.data, lessonId: 'ent-next' } }), { code: 'failed-precondition' })
  }
  assert.equal(calls, 0)
  assert.equal((await db.collection(`${f.base}/practiceFeedback`).get()).size, 0)
  assert.equal((await db.doc(`_enterprisePracticeUsage/${day}`).get()).data().requests, 0)
  await db.doc(`${f.base}/lessons/ent-first`).set({ completedAt: new Date(now).toISOString() })
  await f.submit({ evaluate, data: { ...f.data, lessonId: 'ent-next' } })
  assert.equal(calls, 1)
})

test('quota transactions prevent concurrent overspend and fail closed on corrupted counters', async () => {
  const f = await fixture()
  const limited = { ...config, limits: { user: 1, global: 1, tokens: 32000 } }
  let calls = 0
  const results = await Promise.allSettled(['one', 'two', 'three'].map(answer => f.submit({ config: limited, data: { ...f.data, answer }, evaluate: async () => { calls++; return feedback } })))
  assert.equal(results.filter(row => row.status === 'fulfilled').length, 1)
  assert.equal(results.filter(row => row.status === 'rejected' && row.reason.code === 'resource-exhausted').length, 2)
  assert.equal(calls, 1)
  await db.doc(`_enterprisePracticeUsage/${day}`).set({ requests: -1, reservedTokens: 0 })
  await assert.rejects(f.submit({ data: { ...f.data, answer: 'four' } }), { code: 'unavailable' })
  await db.doc(`_enterprisePracticeUsage/${day}`).set({ requests: 0, reservedTokens: 6000000 })
  await assert.rejects(f.submit({ data: { ...f.data, answer: 'five' } }), { code: 'resource-exhausted' })
})

test('a cached result remains private after revocation, subscription expiry or account deletion', async () => {
  const f = await fixture()
  await f.submit()
  const memberRef = db.doc(`organizations/${f.organizationId}/members/${f.uid}`)
  await memberRef.update({ active: false })
  await assert.rejects(f.submit(), { code: 'permission-denied' })
  await memberRef.update({ active: true })
  await db.doc(`organizations/${f.organizationId}`).set({ enabled: true, offer: 'stripe-enterprise', entitlement: { status: 'active', paidUntil: new Date(now - 1).toISOString() } })
  await assert.rejects(f.submit(), { code: 'permission-denied' })
  await db.doc(`organizations/${f.organizationId}`).set({ enabled: true, offer: 'managed-pilot' })
  await db.doc(`_accountLifecycle/${f.uid}`).set({ status: 'deleting' })
  await assert.rejects(f.submit(), { code: 'permission-denied' })
})

test('membership and account deletion are rechecked after provider, and stale leases cannot publish', async () => {
  for (const mode of ['revoke', 'delete', 'disabled', 'expired-lease']) {
    const f = await fixture()
    let disabled = false
    const patch = {
      lookup: async () => ({ ...account, disabled }),
      ...(mode === 'expired-lease' ? { clock: () => now + 90001 } : {}),
      evaluate: async () => {
        if (mode === 'revoke') await db.doc(`organizations/${f.organizationId}/members/${f.uid}`).update({ active: false })
        if (mode === 'delete') {
          await db.doc(`_accountLifecycle/${f.uid}`).set({ status: 'deleting' })
          await db.recursiveDelete(db.collection(`${f.base}/practiceFeedback`))
        }
        if (mode === 'disabled') disabled = true
        return feedback
      },
    }
    await assert.rejects(f.submit(patch), { code: mode === 'expired-lease' ? 'aborted' : 'permission-denied' })
    assert.equal((await db.collection(`${f.base}/practiceFeedback`).get()).docs.some(row => row.data().status === 'completed'), false)
  }
})

test('provider failure consumes reservation, enforces cooldown, then allows explicit retry', async () => {
  const f = await fixture()
  let calls = 0
  await assert.rejects(f.submit({ evaluate: async () => { calls++; return { invalid: 'provider' } } }), { code: 'unavailable' })
  await assert.rejects(f.submit({ now: now + 60000, evaluate: async () => { calls++; return feedback } }), { code: 'unavailable' })
  assert.equal(calls, 1)
  const finished = await f.submit({ now: now + 62000, clock: () => now + 63000, evaluate: async () => { calls++; return feedback } })
  assert.deepEqual(finished, feedback)
  assert.equal(calls, 2)
  assert.equal((await db.doc(`${f.base}/limits/practice-${day}`).get()).data().requests, 2)
})

test('a replacement after a crashed lease cannot be overwritten by the original late response', async () => {
  const f = await fixture()
  let finish
  const original = f.submit({ evaluate: async () => await new Promise(resolve => { finish = resolve }), clock: () => now + 93000 })
  while (!finish) await new Promise(resolve => setTimeout(resolve, 10))
  const replacement = { ...feedback, message: 'Le nouvel essai est enregistré.' }
  await f.submit({ now: now + 91000, clock: () => now + 92000, evaluate: async () => replacement })
  finish(feedback)
  await assert.rejects(original, { code: 'aborted' })
  assert.deepEqual(await f.submit(), replacement)
  assert.equal((await db.doc(`${f.base}/limits/practice-${day}`).get()).data().requests, 2)
})

test('rubric, prompt and organization changes do not reuse another correction, and client access is denied', async () => {
  const f = await fixture()
  let calls = 0
  const evaluate = async () => { calls++; return feedback }
  await f.submit({ evaluate })
  await f.submit({ evaluate, rubrics: { ...rubrics, version: 2 } })
  await f.submit({ evaluate, config: { ...config, model: 'mistral-small-2603' } })
  const other = `practice-other-${sequence}`
  await db.doc(`organizations/${other}`).set({ enabled: true, offer: 'managed-pilot' })
  await db.doc(`organizations/${other}/members/${f.uid}`).set({ active: true, role: 'learner' })
  await f.submit({ evaluate, data: { ...f.data, organizationId: other } })
  assert.equal(calls, 4)
  const receipt = (await db.collection(`${f.base}/practiceFeedback`).get()).docs[0]
  for (const uid of [f.uid, 'other-member', 'manager']) {
    const client = environment.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: true, firebase: { sign_in_provider: 'google.com' } }).firestore()
    await assertFails(getDoc(doc(client, receipt.ref.path)))
    await assertFails(setDoc(doc(client, receipt.ref.path), { status: 'completed', feedback }))
    await assertFails(getDoc(doc(client, `_enterprisePracticeUsage/${day}`)))
    await assertFails(setDoc(doc(client, `${f.base}/limits/practice-${day}`), { requests: 0 }))
  }
})
