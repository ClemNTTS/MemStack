import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { qualificationCorpus, evaluateQualification } from './qualification.mjs'

test('qualification cases reference existing versioned rubrics and diverse editorial expectations', async () => {
  const { challenges } = JSON.parse(await readFile(new URL('../../shared/challengeDossiers.json', import.meta.url), 'utf8'))
  assert.equal(new Set(qualificationCorpus.map(item => item.id)).size, qualificationCorpus.length)
  for (const item of qualificationCorpus) {
    const dossier = challenges.find(dossier => dossier.id === item.challengeId && dossier.version === item.challengeVersion)
    assert.ok(dossier)
    assert.ok(item.response.observations.trim() && item.response.actions.trim())
    assert.ok(item.expected.missedCheckpointIndices.every(index => index < dossier.checkpoints.length))
  }
  for (const category of ['correct', 'partial', 'wrong', 'alternative', 'hostile', 'hostile-correct', 'reference-confusion']) assert.ok(qualificationCorpus.some(item => item.category === category))
})

test('offline evaluation exposes missing cases, false acceptance, false rejection and rubric differences', () => {
  const report = evaluateQualification([
    { id: 'expiry-wrong', verdict: 'validated', missedCheckpointIndices: [] },
    { id: 'expiry-correct', verdict: 'retry', missedCheckpointIndices: [0] },
    { id: 'docker-data-loss', verdict: 'retry', missedCheckpointIndices: [1] },
  ])
  assert.equal(report.missing, qualificationCorpus.length - 3)
  assert.equal(report.falseValidations, 1)
  assert.equal(report.falseRejections, 1)
  assert.equal(report.review, 3)
  assert.throws(() => evaluateQualification([{ id: 'invented', verdict: 'validated', missedCheckpointIndices: [] }]))
  assert.throws(() => evaluateQualification([{ id: 'expiry-correct', verdict: 'validated', missedCheckpointIndices: [0] }]))
})
