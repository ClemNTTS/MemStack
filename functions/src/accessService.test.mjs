import test from 'node:test'
import assert from 'node:assert/strict'
import { getAccessStatus, updateMemberAccess, isInvited, validateMemberAccessRequest } from './accessService.mjs'

const auth = { uid: 'admin', token: { memstackAdmin: true, firebase: { sign_in_provider: 'google.com' } } }
const config = { enabled: true, invited: ['admin'], limits: { user: 5, global: 25, tokens: 400000 } }
function fakeDb() {
  const data = new Map()
  return { data, doc: path => path, collection: path => ({ doc: () => `${path}/audit` }), runTransaction: async callback => {
    const pending = []
    const result = await callback({ get: async path => ({ exists: data.has(path), data: () => data.get(path) }), set: (path, value) => pending.push([path, value]), create: (path, value) => pending.push([path, value]) })
    pending.forEach(([path, value]) => data.set(path, value))
    return result
  } }
}
test('members cannot write entitlement or invitation, forged uid does not grant admin', async () => {
  const db = fakeDb()
  for (const candidate of [null, { ...auth, token: {} }, { ...auth, token: { firebase: { sign_in_provider: 'google.com' } } }, { ...auth, token: { ...auth.token, memstackAdmin: 'true' } }]) {
    await assert.rejects(updateMemberAccess({ db, auth: candidate, targetUid: 'member', aiEnabled: true, betaInvited: true, timestamp: 1 }))
    assert.equal(db.data.size, 0)
  }
})
test('admin rights and invitations change atomically with audit and without quota mutation', async () => {
  const db = fakeDb()
  await updateMemberAccess({ db, auth, targetUid: 'member', aiEnabled: false, betaInvited: false, timestamp: 1 })
  assert.deepEqual(db.data.get('users/member/settings/challengeAccess'), { aiEnabled: false, betaInvited: false })
  assert.equal(db.data.get('_challengeAccessAudit/audit').actorUid, 'admin')
  assert.equal(db.data.size, 2)
})
test('deleting actor or target prevents every write', async () => {
  for (const uid of ['admin', 'member']) {
    const db = fakeDb()
    db.data.set(`_accountLifecycle/${uid}`, { status: 'deleting' })
    await assert.rejects(updateMemberAccess({ db, auth, targetUid: 'member', aiEnabled: true, betaInvited: true, timestamp: 1 }))
    assert.equal(db.data.size, 1)
  }
})
test('quota status only reads authenticated own account and returns no global usage', async () => {
  const db = fakeDb()
  db.data.set('users/admin/challengeAiUsage/2026-10-09', { requests: 2 })
  db.data.set('users/other/challengeAiUsage/2026-10-09', { requests: 5 })
  db.data.set('_challengeAiUsage/2026-10-09', { requests: 25, reservedTokens: 400000 })
  const result = await getAccessStatus({ db, auth, config, now: Date.UTC(2026, 9, 9) })
  assert.equal(result.remaining, 3)
  assert.equal(result.globalAvailable, false)
  assert.equal(result.resetsAt, '2026-10-10T00:00:00.000Z')
  assert.equal(Object.hasOwn(result, 'reservedTokens'), false)
  assert.equal(db.data.size, 3)
})
test('explicit invitation revoke overrides environment, missing value preserves existing beta', () => {
  assert.equal(isInvited({}, 'admin', ['admin']), true)
  assert.equal(isInvited({ betaInvited: false }, 'admin', ['admin']), false)
  assert.equal(isInvited({ betaInvited: true }, 'member', []), true)
  assert.equal(isInvited({ betaInvited: 'true' }, 'admin', ['admin']), false)
})

test('admin request accepts exact email flags only and cannot assign role or quota', () => {
  const valid = { email: 'test@example.com', aiEnabled: true, betaInvited: false }
  assert.deepEqual(validateMemberAccessRequest(valid), valid)
  for (const data of [null, [], {}, { ...valid, uid: 'victim' }, { ...valid, memstackAdmin: true }, { ...valid, dailyLimit: 999 }, { ...valid, aiEnabled: 'true' }, { ...valid, email: '../users/victim' }, { ...valid, email: ' test@example.com' }]) assert.throws(() => validateMemberAccessRequest(data))
})

test('invalid server quota data fails rather than inventing available analyses', async () => {
  const db = fakeDb()
  db.data.set('_challengeAiUsage/2026-10-09', { requests: '0' })
  await assert.rejects(getAccessStatus({ db, auth, config, now: Date.UTC(2026, 9, 9) }))
})
