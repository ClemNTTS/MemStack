import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { qualificationCorpus, qualificationCorpusVersion, qualificationCorpusHash, evaluateQualification, evaluateStability } from './qualification.mjs'
import { validateAttempt } from '../../functions/src/analysis.mjs'

test('qualification cases reference existing versioned rubrics and diverse editorial expectations', async () => {
  const { challenges } = JSON.parse(await readFile(new URL('../../shared/challengeDossiers.json', import.meta.url), 'utf8'))
  assert.equal(new Set(qualificationCorpus.map(item => item.id)).size, qualificationCorpus.length)
  for (const item of qualificationCorpus) {
    const dossier = challenges.find(dossier => dossier.id === item.challengeId && dossier.version === item.challengeVersion)
    assert.ok(dossier)
    assert.ok(item.response.observations.trim() && item.response.actions.trim())
    assert.ok(item.expected.missedCheckpointIndices.every(index => index < dossier.checkpoints.length))
    assert.equal(validateAttempt({ version: 2, challengeVersion: item.challengeVersion, challengeId: item.challengeId,
      observations: item.response.observations, actions: item.response.actions,
      answer: `${item.response.observations}\n\n${item.response.actions}`, submittedAt: { toMillis: () => 0 } }, challenges).id, item.challengeId)
  }
  for (const category of ['correct', 'partial', 'wrong', 'alternative', 'hostile', 'hostile-correct', 'reference-confusion']) assert.ok(qualificationCorpus.some(item => item.category === category))
})

test('stability qualification keeps failures, requires repeated full runs and pins configuration', () => {
  const results = qualificationCorpus.map(item => ({ id: item.id, ...structuredClone(item.expected) }))
  const run = id => ({ runId: id, corpusVersion: qualificationCorpusVersion, corpusHash: qualificationCorpusHash,
    model: 'pinned-model', promptVersion: 'fixed-prompt', results: structuredClone(results) })
  assert.equal(evaluateStability([run('one')]).qualified, false)
  assert.equal(evaluateStability([run('one'), run('two'), run('three')]).qualified, true)
  const failed = run('bad')
  failed.results.find(result => result.id === 'volumes-no-extra-obligations').verdict = 'retry'
  failed.results.find(result => result.id === 'volumes-no-extra-obligations').missedCheckpointIndices = [1]
  const report = evaluateStability([failed, run('two'), run('three')])
  assert.equal(report.qualified, false)
  assert.equal(report.unstable.length, 1)
  assert.equal(report.reports[0].falseRejections, 1)
  assert.throws(() => evaluateStability([run('one'), run('one')]))
  assert.throws(() => evaluateStability([{ ...run('one'), corpusHash: 'changed' }]))
  assert.throws(() => evaluateStability([run('one'), { ...run('two'), promptVersion: 'other' }]))
  assert.equal(evaluateStability([]).qualified, false)
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
