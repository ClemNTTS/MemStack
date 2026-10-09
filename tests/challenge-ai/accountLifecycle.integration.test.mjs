import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createAccountLifecycle } from '../../functions/src/accountLifecycle.mjs'

const require = createRequire(new URL('../../functions/package.json', import.meta.url))
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

let app
let db
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator required; production prohibited')
  app = initializeApp({ projectId: 'demo-memstack-account-lifecycle' }, 'account-lifecycle-test')
  db = getFirestore(app)
})
after(async () => { if (app) await deleteApp(app) })
const request = uid => ({ app: { appId: 'test' }, auth: { uid, token: { auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_provider: 'google.com' } } }, data: {} })
test('own export and confirmed deletion leave other accounts and global quotas untouched', async () => {
  const uid = 'lifecycle-alice'
  const other = 'lifecycle-bob'
  await db.doc(`users/${uid}/settings/learning`).set({ dailyLessonGoal: 2 })
  await db.doc(`users/${uid}/challengeAttempts/one`).set({ observations: 'Test' })
  await db.doc(`users/${uid}/challengeAnalyses/one`).set({ verdict: 'retry' })
  await db.doc(`users/${uid}/contentReports/one`).set({ status: 'needs_review' })
  await db.doc(`users/${uid}/challengeAiUsage/today`).set({ requests: 2 })
  await db.doc(`users/${other}/settings/learning`).set({ dailyLessonGoal: 3 })
  await db.doc('_challengeAiUsage/lifecycle-test').set({ requests: 4 })
  await db.doc('_challengeAccessAudit/lifecycle-test').set({ actorUid: other, targetUid: uid, action: 'grant' })
  const deleted = []
  const handlers = createAccountLifecycle({ db, auth: { getUser: async target => { assert.equal(target, uid); return { email: 'test@example.invalid', metadata: { creationTime: 'now', lastSignInTime: 'now' } } }, deleteUser: async target => { deleted.push(target) } } })
  await assert.rejects(handlers.deleteAccountData({ ...request(uid), data: { confirmation: 'SUPPRIMER', uid: other } }))
  const exported = await handlers.exportAccountData(request(uid))
  assert.equal(exported.documents.length, 5)
  assert.equal(exported.accessAudit[0].actorUid, null)
  assert.equal(exported.accessAudit[0].targetUid, uid)
  await handlers.deleteAccountData({ ...request(uid), data: { confirmation: 'SUPPRIMER' } })
  assert.deepEqual(deleted, [uid])
  assert.equal((await db.doc(`users/${uid}/contentReports/one`).get()).exists, false)
  assert.equal((await db.doc(`users/${other}/settings/learning`).get()).data().dailyLessonGoal, 3)
  assert.equal((await db.doc('_challengeAiUsage/lifecycle-test').get()).data().requests, 4)
  assert.equal((await db.doc('_challengeAccessAudit/lifecycle-test').get()).data().targetUid, null)
  assert.equal((await db.doc(`_accountLifecycle/${uid}`).get()).data().status, 'deleted')
  await assert.rejects(handlers.exportAccountData(request(uid)))
})
