import { readFile } from 'node:fs/promises'
import { after, before, beforeEach, test } from 'node:test'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

let env
const dossiers = JSON.parse(await readFile(new URL('../../shared/challengeDossiers.json', import.meta.url), 'utf8')).challenges
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run with a Firestore emulator; no production access is permitted')
  env = await initializeTestEnvironment({ projectId: 'demo-memstack-challenge-ai', firestore: {
    rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8'),
  } })
})
async function grantAccess() {
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'users/alice/settings/challengeAccess'), { aiEnabled: true })
  })
}
beforeEach(async () => { await env.clearFirestore(); await grantAccess() })
after(async () => env?.cleanup())
const db = uid => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()
const path = 'users/alice/challengeAttempts/attempt-1'
const payload = version => ({ version, challengeId: 'docker-images-diagnostic', challengeVersion: version,
  answer: version === 1 ? 'Je reconstruis et recrée.' : 'Image ancienne\n\nReconstruire et recréer',
  ...(version === 2 ? { observations: 'Image ancienne', actions: 'Reconstruire et recréer' } : {}),
  submittedAt: serverTimestamp(), outcome: '' })

const examReport = (patch = {}) => ({ version: 2, targetType: 'challenge', lessonId: '', cardId: '',
  challengeId: 'docker-images-diagnostic', challengeVersion: 2, rubricVersion: 2,
  attemptId: '', promptVersion: '', model: '', kind: 'unclear', comment: 'Préciser le cas.',
  contentSnapshot: '{}', contentVersion: 'a'.repeat(64), createdAt: serverTimestamp(), status: 'needs_review', ...patch })

test('versioned exam reports are own immutable review requests, never verdict edits', async () => {
  const reportPath = 'users/alice/contentReports/exam-report'
  await assertSucceeds(setDoc(doc(db('alice'), reportPath), examReport()))
  await assertFails(getDoc(doc(db('bob'), reportPath)))
  await assertFails(updateDoc(doc(db('alice'), reportPath), { status: 'published' }))
  await assertFails(deleteDoc(doc(db('alice'), reportPath)))
  for (const patch of [{ status: 'pending' }, { targetType: 'analysis' }, { verdict: 'validated' }, { model: 'fabricated' }, { rubricVersion: 0 }]) {
    await assertFails(setDoc(doc(db('alice'), 'users/alice/contentReports/invalid-report'), examReport(patch)))
  }
})

test('analysis reports reference the owner immutable attempt and server analysis versions', async () => {
  await env.withSecurityRulesDisabled(async context => {
    const server = context.firestore()
    await setDoc(doc(server, path), payload(2))
    await setDoc(doc(server, 'users/alice/challengeAnalyses/attempt-1'), {
      status: 'completed', challengeVersion: 2, rubricVersion: 2, promptVersion: 'v4', model: 'pinned-model', verdict: 'retry', message: 'Retour'
    })
  })
  const input = examReport({ targetType: 'analysis', attemptId: 'attempt-1', promptVersion: 'v4', model: 'pinned-model' })
  await assertSucceeds(setDoc(doc(db('alice'), 'users/alice/contentReports/analysis-report'), input))
  for (const patch of [{ attemptId: 'another-attempt' }, { model: 'different-model' }, { rubricVersion: 3 }, { challengeId: 'other-challenge' }]) {
    await assertFails(setDoc(doc(db('alice'), 'users/alice/contentReports/bad-analysis-report'), { ...input, ...patch }))
  }
})

test('deletion marker blocks account reads and writes even with a valid old token', async () => {
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), '_accountLifecycle/alice'), { status: 'deleting' })
  })
  await assertFails(getDoc(doc(db('alice'), 'users/alice/settings/challengeAccess')))
  await assertFails(setDoc(doc(db('alice'), path), payload(2)))
  await assertFails(setDoc(doc(db('alice'), 'users/alice/contentReports/report'), examReport()))
  await assertFails(setDoc(doc(db('alice'), 'users/alice/lessons/lesson'), { completedAt: '2026-10-09T00:00:00.000Z' }))
  await assertFails(getDoc(doc(db('alice'), '_accountLifecycle/alice')))
  await assertFails(setDoc(doc(db('alice'), '_challengeAccessAudit/audit'), { actorUid: 'alice' }))
})

test('both historical and structured attempts remain owner-only and immutable', async () => {
  for (const version of [1, 2]) {
    await env.clearFirestore()
    await grantAccess()
    await assertFails(setDoc(doc(db(), path), payload(version)))
    await assertFails(setDoc(doc(db('bob'), path), payload(version)))
    await assertSucceeds(setDoc(doc(db('alice'), path), payload(version)))
    await assertSucceeds(getDoc(doc(db('alice'), path)))
    await assertFails(getDoc(doc(db('bob'), path)))
    await assertFails(updateDoc(doc(db('alice'), path), { answer: 'Réécriture' }))
    await assertFails(updateDoc(doc(db('alice'), path), { submittedAt: serverTimestamp() }))
    await assertFails(deleteDoc(doc(db('alice'), path)))
    await assertFails(updateDoc(doc(db('alice'), path), { outcome: 'understood' }))
    await assertFails(updateDoc(doc(db('alice'), path), { outcome: 'retry' }))
  }
})

test('invalid structured submissions cannot enter history', async () => {
  for (const patch of [ { observations: '' }, { actions: ' ' }, { actions: 'x'.repeat(2001) },
    { answer: 'Réponse fabriquée' }, { challengeVersion: 1 }, { version: 3 }, { outcome: 'understood' }, { feedback: 'fake' } ]) {
    await assertFails(setDoc(doc(db('alice'), path), { ...payload(2), ...patch }))
  }
})

test('every published dossier can be saved while unknown IDs and invented historical versions are denied', async () => {
  for (const dossier of dossiers.filter(entry => entry.version === 2)) {
    await assertSucceeds(setDoc(doc(db('alice'), `users/alice/challengeAttempts/${dossier.id}`), {
      ...payload(2), challengeId: dossier.id,
    }))
    if (!dossiers.some(entry => entry.id === dossier.id && entry.version === 1)) {
      await assertFails(setDoc(doc(db('alice'), `users/alice/challengeAttempts/legacy-${dossier.id}`), {
        ...payload(1), challengeId: dossier.id,
      }))
    }
  }
  await assertFails(setDoc(doc(db('alice'), path), { ...payload(2), challengeId: 'unknown-diagnostic' }))
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

test('AI option access is server-owned and revoked access denies attempts and analyses', async () => {
  const accessPath = 'users/alice/settings/challengeAccess'
  await assertSucceeds(getDoc(doc(db('alice'), accessPath)))
  await assertFails(getDoc(doc(db('bob'), accessPath)))
  await assertFails(setDoc(doc(db('alice'), accessPath), { aiEnabled: true }))
  await assertFails(updateDoc(doc(db('alice'), accessPath), { aiEnabled: false }))
  await assertFails(deleteDoc(doc(db('alice'), accessPath)))
  await assertSucceeds(setDoc(doc(db('alice'), path), payload(2)))
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'users/alice/challengeAnalyses/attempt-1'), { status: 'completed' })
    await setDoc(doc(context.firestore(), accessPath), { aiEnabled: false })
  })
  await assertFails(getDoc(doc(db('alice'), path)))
  await assertFails(getDoc(doc(db('alice'), 'users/alice/challengeAnalyses/attempt-1')))
  await assertFails(updateDoc(doc(db('alice'), path), { outcome: 'understood' }))
  await assertFails(setDoc(doc(db('alice'), 'users/alice/challengeAttempts/attempt-2'), payload(2)))
  await env.withSecurityRulesDisabled(async context => { await deleteDoc(doc(context.firestore(), accessPath)) })
  await assertFails(setDoc(doc(db('alice'), 'users/alice/challengeAttempts/attempt-3'), payload(2)))
})

test('reviews and content reports remain available without the AI option', async () => {
  await env.withSecurityRulesDisabled(async context => {
    await deleteDoc(doc(context.firestore(), 'users/alice/settings/challengeAccess'))
  })
  const reviewPath = 'users/alice/reviews/free-review'
  await assertSucceeds(setDoc(doc(db('alice'), reviewPath), {
    cardId: 'docker-image-card', rating: 'recalled', reviewedAt: '2026-10-08T12:00:00.000Z', kind: 'review',
  }))
  await assertSucceeds(getDoc(doc(db('alice'), reviewPath)))
  await assertFails(getDoc(doc(db('bob'), reviewPath)))
  const reportPath = 'users/alice/contentReports/free-report'
  await assertSucceeds(setDoc(doc(db('alice'), reportPath), {
    version: 1, lessonId: 'docker-images', cardId: '', kind: 'unclear', comment: 'À clarifier',
    contentSnapshot: 'Texte', contentVersion: 'a'.repeat(64), createdAt: serverTimestamp(), status: 'pending',
  }))
  await assertSucceeds(getDoc(doc(db('alice'), reportPath)))
  await assertFails(getDoc(doc(db('bob'), reportPath)))
})
