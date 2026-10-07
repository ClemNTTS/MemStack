import { readFile } from 'node:fs/promises'
import { after, before, beforeEach, test } from 'node:test'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

let env
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run with a Firestore emulator; no production access is permitted')
  env = await initializeTestEnvironment({ projectId: 'demo-memstack-challenge-ai', firestore: {
    rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8'),
  } })
})
beforeEach(async () => env.clearFirestore())
after(async () => env?.cleanup())
const db = uid => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()
const path = 'users/alice/challengeAttempts/attempt-1'
const payload = version => ({ version, challengeId: 'docker-images-diagnostic', challengeVersion: version,
  answer: version === 1 ? 'Je reconstruis et recrée.' : 'Image ancienne\n\nReconstruire et recréer',
  ...(version === 2 ? { observations: 'Image ancienne', actions: 'Reconstruire et recréer' } : {}),
  submittedAt: serverTimestamp(), outcome: '' })

test('both historical and structured attempts remain owner-only and immutable', async () => {
  for (const version of [1, 2]) {
    await env.clearFirestore()
    await assertFails(setDoc(doc(db(), path), payload(version)))
    await assertFails(setDoc(doc(db('bob'), path), payload(version)))
    await assertSucceeds(setDoc(doc(db('alice'), path), payload(version)))
    await assertSucceeds(getDoc(doc(db('alice'), path)))
    await assertFails(getDoc(doc(db('bob'), path)))
    await assertFails(updateDoc(doc(db('alice'), path), { answer: 'Réécriture' }))
    await assertFails(updateDoc(doc(db('alice'), path), { submittedAt: serverTimestamp() }))
    await assertFails(deleteDoc(doc(db('alice'), path)))
    await assertSucceeds(updateDoc(doc(db('alice'), path), { outcome: 'understood' }))
    await assertFails(updateDoc(doc(db('alice'), path), { outcome: 'retry' }))
  }
})

test('invalid structured submissions cannot enter history', async () => {
  for (const patch of [ { observations: '' }, { actions: ' ' }, { actions: 'x'.repeat(2001) },
    { answer: 'Réponse fabriquée' }, { challengeVersion: 1 }, { version: 3 }, { outcome: 'understood' }, { feedback: 'fake' } ]) {
    await assertFails(setDoc(doc(db('alice'), path), { ...payload(2), ...patch }))
  }
})

test('clients cannot forge analysis results or read and change server quota counters', async () => {
  const analysisPath = 'users/alice/challengeAnalyses/attempt-1'
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), analysisPath), { status: 'completed', message: 'Retour' })
  })
  await assertSucceeds(getDoc(doc(db('alice'), analysisPath)))
  await assertFails(getDoc(doc(db('bob'), analysisPath)))
  await assertFails(setDoc(doc(db('alice'), analysisPath), { status: 'completed', message: 'Tout juste' }))
  for (const counterPath of ['_challengeAiUsage/global', 'users/alice/challengeAiUsage/2026-10']) {
    await assertFails(getDoc(doc(db('alice'), counterPath)))
    await assertFails(setDoc(doc(db('alice'), counterPath), { used: 0 }))
  }
})
