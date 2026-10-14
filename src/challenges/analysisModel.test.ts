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

test('v5 keeps the structured v4 contract and rejects incomplete results', () => {
  const result = { ...completed, promptVersion: 'challenge-feedback-v5', verdict: 'retry', missedCheckpointIndices: [1] }
  assert.deepEqual(decodeChallengeAnalysis(result), result)
  for (const patch of [{ missedCheckpointIndices: undefined }, { missedCheckpointIndices: [] }, { verdict: undefined }, { verdict: 'validated' }]) {
    assert.equal(decodeChallengeAnalysis({ ...result, ...patch }), null)
  }
  assert.ok(decodeChallengeAnalysis({ ...result, verdict: 'validated', missedCheckpointIndices: [] }))
})

test('v6 keeps the structured v4 contract and rejects incomplete results', () => {
  const result = { ...completed, promptVersion: 'challenge-feedback-v6', verdict: 'retry', missedCheckpointIndices: [1] }
  assert.deepEqual(decodeChallengeAnalysis(result), result)
  for (const patch of [{ missedCheckpointIndices: undefined }, { missedCheckpointIndices: [] }, { verdict: undefined }, { verdict: 'validated' }]) {
    assert.equal(decodeChallengeAnalysis({ ...result, ...patch }), null)
  }
  assert.ok(decodeChallengeAnalysis({ ...result, verdict: 'validated', missedCheckpointIndices: [] }))
})

test('v7 derives a strict threshold verdict from booleans and permits missed points on success', () => {
  const result = { ...completed, promptVersion: 'challenge-feedback-v7', verdict: 'validated',
    criterionResults: [true, true, true, false], missedCheckpointIndices: [3] }
  assert.deepEqual(decodeChallengeAnalysis(result), result)
  for (const patch of [{ criterionResults: undefined }, { criterionResults: [] }, { criterionResults: [true, true, 'true', false] },
    { missedCheckpointIndices: [] }, { missedCheckpointIndices: [1] }, { verdict: 'retry' }, { status: 'processing', message: '' }]) {
    assert.equal(decodeChallengeAnalysis({ ...result, ...patch }), null)
  }
  const boundary = { ...result, criterionResults: [true, true, true, true, true, true, true, false, false, false], missedCheckpointIndices: [7, 8, 9] }
  assert.equal(decodeChallengeAnalysis(boundary), null)
  assert.ok(decodeChallengeAnalysis({ ...boundary, verdict: 'retry' }))
  assert.equal(decodeChallengeAnalysis({ ...result, promptVersion: 'challenge-feedback-v6' }), null)
})
