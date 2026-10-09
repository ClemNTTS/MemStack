import assert from 'node:assert/strict'
import test from 'node:test'
import { getChallengeExamSummary } from './examSummary.ts'
import type { ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'

const challenge = { id: 'exam', version: 2, rubricVersion: 3 }
const attempt = (id: string, date = '2026-10-01', overrides: Partial<ChallengeAttempt> = {}): ChallengeAttempt => ({
  id, version: 2, challengeId: 'exam', challengeVersion: 2, answer: 'answer', submittedAt: date, outcome: '', ...overrides,
})
const analysis = (overrides: Partial<ChallengeAnalysis> = {}): ChallengeAnalysis => ({
  status: 'completed', verdict: 'validated', message: 'feedback', challengeVersion: 2, rubricVersion: 3,
  model: 'model', promptVersion: 'challenge-feedback-v3', ...overrides,
})

test('success is acquired despite a later retry, without depending on input order', () => {
  const success = attempt('success')
  const later = attempt('later', '2026-10-02')
  assert.deepEqual(getChallengeExamSummary(challenge, [success, later], {
    success: analysis(), later: analysis({ verdict: 'retry' }),
  }), { status: 'validated', attempt: success })
})

test('without success only the latest current attempt determines the status', () => {
  const earlier = attempt('earlier')
  const latest = attempt('latest', '2026-10-02')
  assert.equal(getChallengeExamSummary(challenge, [earlier, latest], { earlier: analysis({ verdict: 'retry' }) }).status, 'pending')
  for (const status of ['failed', 'needs_review'] as const) {
    assert.equal(getChallengeExamSummary(challenge, [latest], { latest: analysis({ status, verdict: undefined }) }).status, 'unavailable')
  }
  assert.equal(getChallengeExamSummary(challenge, [latest], { latest: analysis({ status: 'processing', verdict: undefined }) }).status, 'pending')
  assert.equal(getChallengeExamSummary(challenge, [latest], { latest: analysis({ verdict: 'retry' }) }).status, 'retry')
})

test('historical versions, rubrics, manual assessments and verdictless feedback cannot validate', () => {
  const current = attempt('current')
  for (const overrides of [{ challengeVersion: 1 }, { rubricVersion: 2 }, { verdict: undefined }]) {
    assert.equal(getChallengeExamSummary(challenge, [current], { current: analysis(overrides) }).status, 'historical')
  }
  const legacy = attempt('legacy', '2026-10-02', { version: 1, outcome: 'understood' })
  assert.equal(getChallengeExamSummary(challenge, [legacy], { legacy: analysis() }).status, 'historical')
  const old = attempt('old', '2026-10-02', { challengeVersion: 1 })
  assert.equal(getChallengeExamSummary(challenge, [old], { old: analysis() }).status, 'historical')
  assert.equal(getChallengeExamSummary(challenge, [old, current], { old: analysis() }).status, 'pending')
})

test('unattempted ignores other challenges and orphan analyses', () => {
  assert.deepEqual(getChallengeExamSummary(challenge, [attempt('other', '2026-10-01', { challengeId: 'other' })], {
    orphan: analysis(),
  }), { status: 'unattempted' })
})

test('inherited analysis entries cannot count as server verdicts', () => {
  assert.equal(getChallengeExamSummary(challenge, [attempt('a')], Object.create({ a: analysis() })).status, 'pending')
})
