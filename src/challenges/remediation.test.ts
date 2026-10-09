import assert from 'node:assert/strict'
import test from 'node:test'
import { needsChallengeRevision, revisionChallenge } from './remediation.ts'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'

const challenge = { id: 'exam', version: 2, rubricVersion: 3, lessonIds: ['lesson'] } as Challenge
const attempt = { id: 'attempt', version: 2, challengeId: 'exam', challengeVersion: 2, outcome: 'retry' } as ChallengeAttempt
const analysis = { status: 'completed', verdict: 'retry', challengeVersion: 2, rubricVersion: 3 } as ChallengeAnalysis

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

test('lesson return navigation only accepts a known challenge associated with this lesson', () => {
  assert.equal(revisionChallenge('lesson', 'exam', [challenge]), challenge)
  for (const id of [null, 'missing', 'https://example.com', '../profile']) {
    assert.equal(revisionChallenge('lesson', id, [challenge]), undefined)
  }
  assert.equal(revisionChallenge('other-lesson', 'exam', [challenge]), undefined)
})
