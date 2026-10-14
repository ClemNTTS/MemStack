import assert from 'node:assert/strict'
import test from 'node:test'
import { publicAnalysis, PROMPT_VERSION, callMistral } from '../../functions/src/analysis.mjs'
import { decodeChallengeAnalysis } from '../../src/challenges/analysisModel.ts'

test('client decodes actual server responses throughout the analysis lifecycle', () => {
  for (const status of ['processing', 'completed', 'needs_review']) {
    const message = status === 'completed' ? 'Ton diagnostic est juste.' : ''
    const result = publicAnalysis({ status, message, challengeVersion: 2, rubricVersion: 1,
      promptVersion: PROMPT_VERSION, model: 'mistral-small-version', leaseUntil: 100, createdAt: 0,
      ...(status === 'completed' ? { verdict: 'validated', missedCheckpointIndices: [], criterionResults: [true, true, true] } : {}) })
    const decoded = decodeChallengeAnalysis(result)
    assert.ok(decoded, `Server ${status} result should be readable by the browser`)
    assert.equal(decoded.message, message)
    assert.equal(decoded.promptVersion, PROMPT_VERSION)
  }
})

test('browser accepts a server success with a missed rule even when explanation fails', async () => {
  let calls = 0
  const output = await callMistral({ apiKey: 'fake', model: 'test', dossier: { checkpoints: ['a', 'b', 'c', 'd'] },
    attempt: { observations: 'constat', actions: 'action' }, fetchImpl: async () => {
      if (++calls === 2) throw new Error('timeout')
      return { ok: true, text: async () => JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ criteria: [true, true, true, false] }) } }] }) }
    } })
  const saved = publicAnalysis({ ...output, status: 'completed', promptVersion: PROMPT_VERSION, model: 'test', challengeVersion: 2, rubricVersion: 1 })
  assert.equal(decodeChallengeAnalysis(saved)?.verdict, 'validated')
  assert.deepEqual(decodeChallengeAnalysis(saved)?.missedCheckpointIndices, [3])
})
