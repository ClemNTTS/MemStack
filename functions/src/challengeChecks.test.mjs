import test from 'node:test'
import assert from 'node:assert/strict'
import { gradeChallengeSelections, submitCheckedChallenge, validateCheckedSubmission } from './challengeChecks.mjs'

const challenge = { id: 'exam', challengeVersion: 3, rubricVersion: 2, questions: ['cause', 'action', 'check'].map((id, checkpointIndex) => ({ id, checkpointIndex, options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] })) }
const key = { id: 'exam', challengeVersion: 3, rubricVersion: 2, questions: [{ id: 'cause', correctOptionIds: ['b'] }, { id: 'action', correctOptionIds: ['a', 'c'] }, { id: 'check', correctOptionIds: ['c'] }] }
const selections = { cause: 'b', action: 'c', check: 'c' }
const data = { attemptId: 'attempt', challengeId: 'exam', challengeVersion: 3, selections }

test('deterministic checker accepts permitted alternatives and rejects wrong concepts', () => {
  assert.equal(gradeChallengeSelections(challenge, key, selections).verdict, 'validated')
  assert.equal(gradeChallengeSelections(challenge, key, { ...selections, action: 'a' }).verdict, 'validated')
  const wrong = gradeChallengeSelections(challenge, key, { ...selections, action: 'b' })
  assert.equal(wrong.verdict, 'retry')
  assert.deepEqual(wrong.missedCheckpointIndices, [1])
  assert.deepEqual(wrong.criterionResults, [true, false, true])
})

test('forged verdicts, identities, versions, extra questions and multiple choices never enter grading', () => {
  assert.deepEqual(validateCheckedSubmission(data, [challenge]).selections, selections)
  for (const patch of [{ verdict: 'validated' }, { uid: 'other' }, { challengeVersion: 2 }, { challengeId: 'unknown' }, { attemptId: '../other' },
    { selections: { ...selections, extra: 'a' } }, { selections: { action: 'c', check: 'c' } },
    { selections: { ...selections, cause: ['a', 'b'] } }, { selections: { ...selections, cause: 'unknown' } }, { selections: null }]) {
    assert.throws(() => validateCheckedSubmission({ ...data, ...patch }, [challenge]))
  }
})

function fakeDb() {
  const state = new Map([['users/alice/lessons/one', { completedAt: 'date' }], ['users/alice/lessons/two', { completedAt: 'date' }]])
  let queue = Promise.resolve()
  return { state, doc: path => path, runTransaction: action => {
    const result = queue.then(async () => {
      const writes = new Map()
      const transaction = { get: async ref => ({ exists: state.has(ref), data: () => state.get(ref) }),
        set: (ref, value) => writes.set(ref, value), create: (ref, value) => { assert.ok(!state.has(ref)); writes.set(ref, value) } }
      const value = await action(transaction)
      for (const [ref, entry] of writes) state.set(ref, entry)
      return value
    })
    queue = result.catch(() => {})
    return result
  } }
}

const now = Date.UTC(2026, 9, 13)
const timestamp = { toMillis: () => now }
const parameters = db => ({ db, uid: 'alice', data, questions: [challenge], answerKeys: [key],
  dossiers: [{ id: 'exam', version: 2, courseId: 'course', lessonIds: ['one'] }],
  courses: [{ id: 'course', theme: 'Tests', lessons: [{ id: 'one' }, { id: 'two' }] }], now, timestamp })

test('atomic persisted result survives concurrent retries and cannot be overwritten by changed selections', async () => {
  const db = fakeDb()
  const [one, two] = await Promise.all([submitCheckedChallenge(parameters(db)), submitCheckedChallenge(parameters(db))])
  assert.deepEqual(one, two)
  assert.equal(db.state.get('users/alice/writeBudgets/attempts').count, 1)
  assert.equal(db.state.get('users/alice/challengeAttempts/attempt').result.verdict, 'validated')
  await assert.rejects(submitCheckedChallenge({ ...parameters(db), data: { ...data, selections: { ...selections, cause: 'a' } } }), { code: 'already-exists' })
  assert.equal(db.state.get('users/alice/challengeAttempts/attempt').result.verdict, 'validated')
})

test('missing prerequisites, deleting account and exhausted write budget cause no attempt or AI consumption', async () => {
  for (const failure of ['prerequisites', 'deleting', 'budget']) {
    const db = fakeDb()
    if (failure === 'prerequisites') db.state.delete('users/alice/lessons/one')
    if (failure === 'deleting') db.state.set('_accountLifecycle/alice', {})
    if (failure === 'budget') db.state.set('users/alice/writeBudgets/attempts', { count: 20, windowStartedAt: timestamp })
    await assert.rejects(submitCheckedChallenge(parameters(db)))
    assert.ok(!db.state.has('users/alice/challengeAttempts/attempt'))
    assert.ok(![...db.state.keys()].some(path => path.includes('challengeAiUsage')))
  }
})
