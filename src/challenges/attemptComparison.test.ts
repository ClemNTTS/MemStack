import assert from 'node:assert/strict'
import test from 'node:test'
import { compareChallengeAttempts } from './attemptComparison.ts'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'

const challenge = { id: 'exam', version: 2, rubricVersion: 1, checkpoints: ['A', 'B', 'C'] } as Challenge
const attempt = (id: string, date: string, version = 2): ChallengeAttempt => ({ id, version: 2, challengeId: 'exam', challengeVersion: version, submittedAt: date, answer: 'answer', outcome: '' })
const first = attempt('first', '2026-10-01')
const second = attempt('second', '2026-10-02')
const analysis = (points: number[]): ChallengeAnalysis => ({ status: 'completed', message: 'feedback', verdict: points.length ? 'retry' : 'validated', missedCheckpointIndices: points, challengeVersion: 2, rubricVersion: 1, promptVersion: 'challenge-feedback-v4', model: 'model' })

test('compares immediately preceding attempt independent of input order and isolates other versions', () => {
  const result = compareChallengeAttempts(challenge, second, [second, attempt('old', '2026-10-01T12:00', 1), first], { first: analysis([0, 1]), second: analysis([1, 2]) })
  assert.equal(result?.status, 'points')
  if (result?.status !== 'points') return
  assert.equal(result.previous.id, 'first')
  assert.deepEqual(result.corrected, [0])
  assert.deepEqual(result.remaining, [1])
  assert.deepEqual(result.newlyMissed, [2])
})

test('validated response clears missed points without grading historical self assessment', () => {
  const result = compareChallengeAttempts(challenge, second, [first, second], { first: analysis([0, 1]), second: analysis([]) })
  assert.equal(result?.status, 'points')
  if (result?.status !== 'points') return
  assert.deepEqual(result.corrected, [0, 1])
  assert.deepEqual(result.remaining, [])
})

test('legacy analyses compare verdicts only; malformed, missing or stale results never imply corrected points', () => {
  const old = { ...analysis([0]), promptVersion: 'challenge-feedback-v3', missedCheckpointIndices: undefined }
  assert.equal(compareChallengeAttempts(challenge, second, [first, second], { first: old, second: analysis([]) })?.status, 'verdicts')
  assert.equal(compareChallengeAttempts(challenge, second, [first, second], { first: analysis([99]), second: analysis([]) })?.status, 'verdicts')
  assert.equal(compareChallengeAttempts(challenge, second, [first, second], { first: { ...analysis([0]), rubricVersion: 2 }, second: analysis([]) })?.status, 'unavailable')
  assert.equal(compareChallengeAttempts(challenge, second, [first, second], { first: analysis([0]) })?.status, 'unavailable')
  assert.equal(compareChallengeAttempts(challenge, first, [first, second], {}), null)
  assert.equal(compareChallengeAttempts(challenge, second, [first, second], Object.create({ first: analysis([0]), second: analysis([]) }))?.status, 'unavailable')
})
