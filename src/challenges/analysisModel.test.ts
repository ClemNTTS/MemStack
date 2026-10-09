import assert from 'node:assert/strict'
import test from 'node:test'
import { decodeChallengeAnalysis } from './analysisModel.ts'

const completed = { status: 'completed', message: 'Tu identifies correctement l’image v1.', challengeVersion: 2, rubricVersion: 1, model: 'mistral-test', promptVersion: 'challenge-feedback-v1' }

test('only complete valid analysis messages become visible feedback', () => {
  assert.deepEqual(decodeChallengeAnalysis(completed), completed)
  for (const patch of [{ status: 'done' }, { message: '' }, { challengeVersion: 0 }, { rubricVersion: 1.5 }, { promptVersion: null }, { model: false }, { message: 'x'.repeat(20001) }]) {
    assert.equal(decodeChallengeAnalysis({ ...completed, ...patch }), null)
  }
  for (const status of ['processing', 'failed']) {
    assert.equal(decodeChallengeAnalysis({ ...completed, status }), null)
    assert.ok(decodeChallengeAnalysis({ ...completed, status, message: '' }))
  }
  assert.ok(decodeChallengeAnalysis({ ...completed, status: 'needs_review', message: 'Une vérification est nécessaire.' }))
  assert.ok(decodeChallengeAnalysis({ ...completed, status: 'needs_review', message: '' }))
})

test('v4 requires bounded unique missed indices consistent with the server verdict; v3 stays readable', () => {
  const result = { ...completed, promptVersion: 'challenge-feedback-v4', verdict: 'retry', missedCheckpointIndices: [0, 2] }
  assert.deepEqual(decodeChallengeAnalysis(result), result)
  for (const missedCheckpointIndices of [undefined, [], [-1], [100], [0.5], [1, 1], ['1']]) assert.equal(decodeChallengeAnalysis({ ...result, missedCheckpointIndices }), null)
  assert.ok(decodeChallengeAnalysis({ ...result, verdict: 'validated', missedCheckpointIndices: [] }))
  assert.equal(decodeChallengeAnalysis({ ...result, verdict: 'validated' }), null)
  assert.ok(decodeChallengeAnalysis({ ...completed, promptVersion: 'challenge-feedback-v3', verdict: 'retry' }))
})

test('only completed server analyses with an explicit supported verdict validate an exam', () => {
  for (const verdict of ['validated', 'retry']) {
    assert.equal(decodeChallengeAnalysis({ ...completed, promptVersion: 'challenge-feedback-v3', verdict })?.verdict, verdict)
  }
  assert.equal(decodeChallengeAnalysis(completed)?.verdict, undefined)
  for (const verdict of ['understood', '', true, null]) {
    assert.equal(decodeChallengeAnalysis({ ...completed, verdict }), null)
  }
  assert.equal(decodeChallengeAnalysis({ ...completed, promptVersion: 'challenge-feedback-v3' }), null)
  assert.equal(decodeChallengeAnalysis({ ...completed, status: 'processing', message: '', verdict: 'validated' }), null)
})
