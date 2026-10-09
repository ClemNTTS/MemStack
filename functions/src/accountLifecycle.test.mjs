import test from 'node:test'
import assert from 'node:assert/strict'
import { requireOwnAccount, serializeAccountValue, exportAccountTree } from './accountLifecycle.mjs'

const now = 1800000000000
const request = { app: { appId: 'test' }, auth: { uid: 'alice', token: { auth_time: now / 1000 - 10, firebase: { sign_in_provider: 'google.com' } } }, data: {} }
test('lifecycle identity never accepts a client uid or missing authentication/attestation', () => {
  assert.equal(requireOwnAccount(request), 'alice')
  for (const invalid of [{ ...request, auth: null }, { ...request, app: null }, { ...request, data: { uid: 'bob' } }]) assert.throws(() => requireOwnAccount(invalid))
})
test('destructive requests require exact confirmation and recent Google authentication', () => {
  const valid = { ...request, data: { confirmation: 'SUPPRIMER' } }
  assert.equal(requireOwnAccount(valid, true, now), 'alice')
  for (const invalid of [{ ...valid, data: { confirmation: 'supprimer' } }, { ...valid, auth: { ...valid.auth, token: { ...valid.auth.token, auth_time: now / 1000 - 301 } } }, { ...valid, auth: { ...valid.auth, token: { ...valid.auth.token, firebase: { sign_in_provider: 'password' } } } }]) assert.throws(() => requireOwnAccount(invalid, true, now))
})
test('export descends through absent parent documents and serializes server dates', async () => {
  const child = { path: 'users/alice/settings/learning', get: async () => ({ exists: true, data: () => ({ date: { toDate: () => new Date(0) }, dailyLessonGoal: 1 }) }), listCollections: async () => [] }
  const db = { doc: path => { assert.equal(path, 'users/alice'); return { path, get: async () => ({ exists: false }), listCollections: async () => [{ listDocuments: async () => [child] }] } } }
  assert.deepEqual(await exportAccountTree(db, 'alice'), [{ path: '/settings/learning', data: { date: '1970-01-01T00:00:00.000Z', dailyLessonGoal: 1 } }])
  assert.deepEqual(serializeAccountValue({ dates: [new Date(0)] }), { dates: ['1970-01-01T00:00:00.000Z'] })
})
