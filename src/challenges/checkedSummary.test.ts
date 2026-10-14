import test from 'node:test'
import assert from 'node:assert/strict'
import { getChallengeExamSummary } from './examSummary.ts'
import type { ChallengeAttempt } from '../types/challenge'

const challenge = { id: 'exam', version: 3, rubricVersion: 2 }
const attempt = (id: string, verdict: 'validated' | 'retry'): ChallengeAttempt => ({ id, version: 3, challengeId: 'exam', challengeVersion: 3,
  rubricVersion: 2, submittedAt: id === 'first' ? '2026-10-12T10:00:00.000Z' : '2026-10-13T10:00:00.000Z', answer: '{}', outcome: '',
  result: { feedback: ['a', 'b', 'c'], graderVersion: 'challenge-checks-v1', verdict, correctCount: verdict === 'validated' ? 3 : 1, totalCount: 3,
    criterionResults: verdict === 'validated' ? [true, true, true] : [true, false, false], missedCheckpointIndices: verdict === 'validated' ? [] : [1, 2] } })

test('server checked results validate without any AI service or analysis', () => {
  assert.equal(getChallengeExamSummary(challenge, [attempt('first', 'validated'), attempt('later', 'retry')], {}).status, 'validated')
  assert.equal(getChallengeExamSummary(challenge, [attempt('first', 'retry')], {}).status, 'retry')
})

test('legacy self assessments and AI successes cannot validate the new format', () => {
  const legacy = { ...attempt('old', 'validated'), version: 2 as const, challengeVersion: 2, outcome: 'understood' as const, result: undefined }
  assert.equal(getChallengeExamSummary(challenge, [legacy], { old: { status: 'completed', verdict: 'validated', message: 'validé', model: 'AI', promptVersion: 'v7', challengeVersion: 3, rubricVersion: 2 } }).status, 'historical')
  assert.equal(getChallengeExamSummary(challenge, [{ ...attempt('old', 'validated'), rubricVersion: 1 }], {}).status, 'historical')
})

test('five-question version keeps previous successes historical and accepts its own server result', () => {
  const current = { ...challenge, version: 4, rubricVersion: 3 }
  assert.equal(getChallengeExamSummary(current, [attempt('first', 'validated')], {}).status, 'historical')
  const checked = { ...attempt('later', 'validated'), challengeVersion: 4, rubricVersion: 3,
    result: { ...attempt('later', 'validated').result!, totalCount: 5, correctCount: 4,
      feedback: ['a', 'b', 'c', 'd', 'e'], criterionResults: [true, true, true, true, false], missedCheckpointIndices: [2] } }
  assert.equal(getChallengeExamSummary(current, [checked], {}).status, 'validated')
})
