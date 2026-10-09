import assert from 'node:assert/strict'
import test from 'node:test'
import { needsChallengeRevision, revisionChallenge, targetedRevision } from './remediation.ts'
import { readFileSync } from 'node:fs'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'

const challenge = { id: 'exam', version: 2, rubricVersion: 3, lessonIds: ['lesson'] } as Challenge
const attempt = { id: 'attempt', version: 2, challengeId: 'exam', challengeVersion: 2, outcome: 'retry' } as ChallengeAttempt
const analysis = { status: 'completed', verdict: 'retry', challengeVersion: 2, rubricVersion: 3, promptVersion: 'challenge-feedback-v4' } as ChallengeAnalysis

test('revision requires a completed current server retry, never a manual or historical result', () => {
  assert.equal(needsChallengeRevision(challenge, attempt, analysis), true)
  for (const result of [null, { ...analysis, verdict: 'validated' as const },
    { ...analysis, status: 'processing' as const }, { ...analysis, status: 'needs_review' as const },
    { ...analysis, verdict: undefined }, { ...analysis, challengeVersion: 1 }, { ...analysis, rubricVersion: 1 }]) {
    assert.equal(needsChallengeRevision(challenge, attempt, result), false)
  }
  for (const entry of [{ ...attempt, version: 1 as const }, { ...attempt, challengeId: 'other' }, { ...attempt, challengeVersion: 1 }]) {
    assert.equal(needsChallengeRevision(challenge, entry, analysis), false)
  }
})

test('targeted revision selects only missed reference points and their trusted lessons', () => {
  const dossier = { ...challenge, checkpoints: ['Cause', 'Action', 'Vérification'], lessonIds: ['cause', 'action'], checkpointLessonIds: [['cause'], ['action'], ['action']] }
  assert.deepEqual(targetedRevision(dossier, { ...analysis, missedCheckpointIndices: [1] }), { points: [{ index: 1, text: 'Action' }], lessonIds: ['action'] })
  assert.equal(targetedRevision(dossier, analysis), null)
  for (const missedCheckpointIndices of [[3], [-1], [1.5], [1, 1], []]) assert.equal(targetedRevision(dossier, { ...analysis, missedCheckpointIndices }), null)
  assert.deepEqual(targetedRevision({ ...dossier, checkpointLessonIds: [['https://evil.test'], ['action'], []] }, { ...analysis, missedCheckpointIndices: [0] })?.lessonIds, [])
})

test('every active checkpoint maps to existing associated lesson IDs without changing reference order', () => {
  const dossiers = JSON.parse(readFileSync(new URL('../../shared/challengeDossiers.json', import.meta.url), 'utf8')).challenges as Challenge[]
  for (const dossier of dossiers.filter(entry => entry.version === 2)) {
    if (dossier.id.startsWith('docker-')) continue // Original snapshots are immutable; their sole lesson applies to every point.
    assert.equal(dossier.checkpointLessonIds?.length, dossier.checkpoints.length, dossier.id)
    for (const ids of dossier.checkpointLessonIds ?? []) {
      assert.ok(ids.length > 0, dossier.id)
      assert.equal(new Set(ids).size, ids.length)
      assert.ok(ids.every(id => dossier.lessonIds.includes(id)), dossier.id)
    }
  }
  const boundary = dossiers.find(entry => entry.id === 'tests-expiry-boundary-diagnostic')!
  assert.deepEqual(boundary.checkpointLessonIds?.[0], ['tests-boundaries'])
})

test('lesson return navigation only accepts a known challenge associated with this lesson', () => {
  assert.equal(revisionChallenge('lesson', 'exam', [challenge]), challenge)
  for (const id of [null, 'missing', 'https://example.com', '../profile']) {
    assert.equal(revisionChallenge('lesson', id, [challenge]), undefined)
  }
  assert.equal(revisionChallenge('other-lesson', 'exam', [challenge]), undefined)
})
