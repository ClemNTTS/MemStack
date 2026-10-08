import assert from 'node:assert/strict'
import test from 'node:test'
import evaluation from '../../shared/challengeEvaluationCases.json' with { type: 'json' }
import { challenges, getChallengeVersion } from '../data/challenges.ts'
import { validateChallengeForm } from './attemptModel.ts'

test('qualitative evaluation cases cover each current dossier and fit the actual submission form', () => {
  assert.equal(evaluation.version, 1)
  assert.equal(evaluation.cases.length, challenges.length * 5)
  assert.equal(new Set(evaluation.cases.map(entry => entry.id)).size, evaluation.cases.length)
  for (const challenge of challenges) {
    const cases = evaluation.cases.filter(entry => entry.challengeId === challenge.id)
    assert.equal(cases.length, 5)
    assert.deepEqual(cases.map(entry => entry.kind).sort(), ['alternative', 'correct', 'instruction-injection', 'partial', 'wrong'])
    for (const entry of cases) {
      assert.equal(getChallengeVersion(entry.challengeId, entry.challengeVersion), challenge)
      const form = validateChallengeForm(entry.challengeId, entry.observations, entry.actions)
      assert.equal(form.observations, entry.observations)
      assert.equal(form.actions, entry.actions)
      assert.ok(form.answer.length <= 4000)
      for (const findings of Object.values(entry.expectedFindings)) {
        assert.ok(Array.isArray(findings))
        assert.ok(findings.every(finding => typeof finding === 'string' && finding.trim().length > 0))
      }
      assert.ok(entry.expectedFindings.criticismsToAvoid.length > 0)
      if (entry.kind === 'correct' || entry.kind === 'alternative') {
        assert.equal(entry.expectedFindings.incorrectPoints.length, 0)
        assert.equal(entry.expectedFindings.omissions.length, 0)
      }
    }
  }
})
