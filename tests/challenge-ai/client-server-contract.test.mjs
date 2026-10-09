import assert from 'node:assert/strict'
import test from 'node:test'
import { publicAnalysis, PROMPT_VERSION } from '../../functions/src/analysis.mjs'
import { decodeChallengeAnalysis } from '../../src/challenges/analysisModel.ts'

test('client decodes actual server responses throughout the analysis lifecycle', () => {
  for (const status of ['processing', 'completed', 'needs_review']) {
    const message = status === 'completed' ? 'Ton diagnostic est juste.' : ''
    const result = publicAnalysis({ status, message, challengeVersion: 2, rubricVersion: 1,
      promptVersion: PROMPT_VERSION, model: 'mistral-small-version', leaseUntil: 100, createdAt: 0,
      ...(status === 'completed' ? { verdict: 'validated' } : {}) })
    const decoded = decodeChallengeAnalysis(result)
    assert.ok(decoded, `Server ${status} result should be readable by the browser`)
    assert.equal(decoded.message, message)
    assert.equal(decoded.promptVersion, PROMPT_VERSION)
  }
})
