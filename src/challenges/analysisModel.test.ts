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
