import test from 'node:test'
import assert from 'node:assert/strict'
import { claimAnalysis } from './claim.mjs'

const dossier = { id: 'docker-images-diagnostic', version: 2, rubricVersion: 1, courseId: 'course', lessonIds: ['one'] }
const attempt = { version: 2, challengeVersion: 2, challengeId: dossier.id, observations: 'Constat', actions: 'Action', answer: 'Constat\n\nAction', submittedAt: { toMillis: () => 1 } }
const courses = [{ id: 'course', theme: 'Tests', lessons: [{ id: 'one' }, { id: 'two' }, { id: 'three' }] }]
const config = { enabled: true, invited: ['alice'], model: 'model-2601', hasKey: true, limits: { user: 5, global: 25, tokens: 400000 } }
const now = Date.UTC(2026, 9, 7)

function fakeDb() {
  const data = new Map([['users/alice/lessons/one', { completedAt: 'date' }], ['users/alice/lessons/two', { completedAt: 'date' }], ['users/alice/settings/challengeAccess', { aiEnabled: true }], ['users/alice/challengeAttempts/attempt-1', attempt], ['users/alice/challengeAttempts/attempt-2', attempt]])
  let queue = Promise.resolve()
  return {
    data,
    doc: path => path,
    runTransaction: callback => {
      const result = queue.then(async () => {
        const pending = new Map()
        const tx = {
          get: async path => ({ exists: data.has(path), data: () => data.get(path) }),
          set: (path, value) => pending.set(path, value),
          create: (path, value) => { assert.ok(!data.has(path)); pending.set(path, value) },
          update: (path, value) => pending.set(path, { ...data.get(path), ...value })
        }
        const value = await callback(tx)
        for (const [path, item] of pending) data.set(path, item)
        return value
      })
      queue = result.catch(() => {})
      return result
    }
  }
}
const args = db => ({ db, uid: 'alice', attemptId: 'attempt-1', now, config, dossiers: [dossier], courses, timestamp: 1 })

test('server prerequisites block direct analysis calls before quota reservation', async () => {
  for (const missing of ['one', 'two']) {
    const db = fakeDb()
    db.data.delete(`users/alice/lessons/${missing}`)
    if (missing === 'one') db.data.set('users/alice/lessons/three', { completedAt: 'date' })
    await assert.rejects(claimAnalysis(args(db)), error => error.code === 'failed-precondition')
    assert.equal(db.data.has('_challengeAiUsage/2026-10-07'), false)
    assert.equal(db.data.has('users/alice/challengeAnalyses/attempt-1'), false)
  }
})

test('missing course configuration fails closed and unrelated completions do not count', async () => {
  const db = fakeDb()
  await assert.rejects(claimAnalysis({ ...args(db), courses: [] }), error => error.code === 'failed-precondition')
  db.data.delete('users/alice/lessons/two')
  db.data.set('users/alice/lessons/unrelated', { completedAt: 'date' })
  await assert.rejects(claimAnalysis(args(db)), error => error.code === 'failed-precondition')
})

test('document invitation overrides env and deletion tombstone blocks cached results', async () => {
  const db = fakeDb()
  db.data.set('users/alice/settings/challengeAccess', { aiEnabled: true, betaInvited: false })
  await assert.rejects(claimAnalysis(args(db)))
  db.data.set('users/alice/settings/challengeAccess', { aiEnabled: true, betaInvited: true })
  assert.equal((await claimAnalysis({ ...args(db), config: { ...config, invited: [] } })).start, true)
  db.data.set('_accountLifecycle/alice', { status: 'deleting' })
  await assert.rejects(claimAnalysis(args(db)))
  assert.equal(db.data.get('users/alice/challengeAiUsage/2026-10-07').requests, 1)
})

test('concurrent duplicate claims reserve one request and one provider dispatch', async () => {
  const db = fakeDb()
  const claims = await Promise.all([claimAnalysis(args(db)), claimAnalysis(args(db))])
  assert.equal(claims.filter(item => item.start).length, 1)
  assert.equal(db.data.get('_challengeAiUsage/2026-10-07').requests, 1)
  assert.equal(db.data.get('users/alice/challengeAiUsage/2026-10-07').requests, 1)
})
test('expired lease becomes terminal without allocating another request', async () => {
  const db = fakeDb()
  await claimAnalysis(args(db))
  const result = await claimAnalysis({ ...args(db), now: now + 120001 })
  assert.equal(result.result.status, 'needs_review')
  assert.ok(!result.start)
  assert.equal(db.data.get('_challengeAiUsage/2026-10-07').requests, 1)
})
test('completed feedback can be reused after service disable without new quota', async () => {
  const db = fakeDb()
  db.data.set('users/alice/challengeAnalyses/attempt-1', { status: 'completed', message: 'Retour' })
  const result = await claimAnalysis({ ...args(db), config: { ...config, enabled: false } })
  assert.equal(result.result.message, 'Retour')
  assert.equal(db.data.has('_challengeAiUsage/2026-10-07'), false)
})
test('disabled, uninvited, other owner, unknown model and exhausted quota prevent reservations', async () => {
  for (const change of [{ config: { ...config, enabled: false } }, { config: { ...config, invited: [] } }, { uid: 'bob', config: { ...config, invited: ['bob'] } }, { config: { ...config, model: 'mistral-latest' } }, { config: { ...config, hasKey: false } }]) {
    const db = fakeDb()
    await assert.rejects(claimAnalysis({ ...args(db), ...change }))
    assert.equal(db.data.has('_challengeAiUsage/2026-10-07'), false)
  }
  const db = fakeDb()
  await claimAnalysis({ ...args(db), config: { ...config, limits: { ...config.limits, user: 1 } } })
  await assert.rejects(claimAnalysis({ ...args(db), attemptId: 'attempt-2', config: { ...config, limits: { ...config.limits, user: 1 } } }))
  assert.equal(db.data.get('_challengeAiUsage/2026-10-07').requests, 1)
})

test('missing, false or revoked AI option access denies calls even for invited accounts and saved feedback', async () => {
  for (const value of [undefined, { aiEnabled: false }, { aiEnabled: 'true' }]) {
    const db = fakeDb()
    if (value === undefined) db.data.delete('users/alice/settings/challengeAccess')
    else db.data.set('users/alice/settings/challengeAccess', value)
    db.data.set('users/alice/challengeAnalyses/attempt-1', { status: 'completed', message: 'Retour' })
    await assert.rejects(claimAnalysis(args(db)), error => error.code === 'permission-denied')
    assert.equal(db.data.has('_challengeAiUsage/2026-10-07'), false)
  }
})
