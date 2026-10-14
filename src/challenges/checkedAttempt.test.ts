import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { challenges } from '../data/challenges.ts'
import { decodeChallengeAttempt } from './attemptModel.ts'
import { loadSelectionDraft, selectionDraftKey } from './selectionDraft.ts'

const require = createRequire(import.meta.url)
const { gradeChallengeSelections, validateCheckedSubmission } = require('../../functions/src/challengeChecks.mjs')
const keys = JSON.parse(readFileSync(new URL('../../shared/challengeAnswerKeys.json', import.meta.url), 'utf8')).challenges
const cases = JSON.parse(readFileSync(new URL('../../shared/challengeStrongStudentCases.json', import.meta.url), 'utf8')).cases

test('all 36 persisted server results decode without trusting any AI or manual verdict', () => {
  for (const challenge of challenges) {
    const student = cases.find((entry: { challengeId: string }) => entry.challengeId === challenge.id)
    const key = keys.find((entry: { id: string }) => entry.id === challenge.id)
    const serverChallenge = { id: challenge.id, challengeVersion: 3, rubricVersion: 2, questions: challenge.questions }
    const { selections } = validateCheckedSubmission({ attemptId: 'server-checked', challengeId: challenge.id, challengeVersion: 3, selections: student.selections }, [serverChallenge])
    const stored = { version: 3, challengeId: challenge.id, challengeVersion: 3, rubricVersion: 2, selections,
      answer: JSON.stringify(selections), outcome: '', submittedAt: '2026-10-13T12:00:00.000Z',
      result: gradeChallengeSelections(serverChallenge, key, selections) }
    assert.equal(decodeChallengeAttempt('server-checked', stored)?.result?.verdict, 'validated', challenge.id)
    for (const patch of [{ outcome: 'understood' }, { rubricVersion: 1 }, { answer: 'different' }, { result: { ...stored.result, correctCount: 0 } },
      { result: { ...stored.result, verdict: 'retry' } }, { result: { ...stored.result, criterionResults: [true] } },
      { result: { ...stored.result, feedback: [] } }, { selections: {} }]) {
      assert.equal(decodeChallengeAttempt('server-checked', { ...stored, ...patch }), null, challenge.id)
    }
  }
})

test('selection drafts cannot cross accounts, versions or admit unknown choices', () => {
  const challenge = challenges[0]
  const selected = { [challenge.questions![0].id]: challenge.questions![0].options[0].id, injected: 'anything' }
  const entries = new Map([[selectionDraftKey('alice', challenge), JSON.stringify(selected)]])
  const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value) }, removeItem: (key: string) => { entries.delete(key) } }
  assert.deepEqual(loadSelectionDraft(storage, 'bob', challenge), {})
  assert.deepEqual(loadSelectionDraft(storage, 'alice', { ...challenge, version: 4 }), {})
  assert.deepEqual(Object.keys(loadSelectionDraft(storage, 'alice', challenge)), [challenge.questions![0].id])
})
