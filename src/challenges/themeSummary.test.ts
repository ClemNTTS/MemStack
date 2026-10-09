import assert from 'node:assert/strict'
import test from 'node:test'
import { getThemeSummary } from './themeSummary.ts'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'

const courses = [{ id: 'course', theme: 'Tests', title: 'Tests', lessonIds: ['one', 'two'] }]
const challenge = { id: 'exam', courseId: 'course', version: 1, rubricVersion: 1, checkpoints: ['Boundary', 'Clock'] } as Challenge
const attempt = (id: string, submittedAt = '2026-10-09'): ChallengeAttempt => ({ id, submittedAt, version: 2, challengeId: 'exam', challengeVersion: 1, answer: 'answer', outcome: '' })
const analysis = (overrides: Partial<ChallengeAnalysis> = {}): ChallengeAnalysis => ({ status: 'completed', verdict: 'retry', challengeVersion: 1, rubricVersion: 1, model: 'model', message: 'feedback', promptVersion: 'challenge-feedback-v4', missedCheckpointIndices: [1], ...overrides })

test('theme summary separates reading progress, acquired exams and precise missed points', () => {
  const result = getThemeSummary('Tests', courses, [challenge], { one: 'date' }, [attempt('a')], { a: analysis() })
  assert.equal(result.lessonsCompleted, 1)
  assert.equal(result.lessonsTotal, 2)
  assert.equal(result.examsValidated, 0)
  assert.deepEqual(result.notions, [{ challengeId: 'exam', checkpointIndex: 1, label: 'Clock' }])
  assert.equal(result.retriesWithoutNotions, 0)
})

test('acquired validation excludes later failures from points to consolidate', () => {
  const result = getThemeSummary('Tests', courses, [challenge], {}, [attempt('a'), attempt('b', '2026-10-10')], {
    a: analysis({ verdict: 'validated', missedCheckpointIndices: [] }), b: analysis(),
  })
  assert.equal(result.examsValidated, 1)
  assert.deepEqual(result.notions, [])
})

test('historical or absent structured feedback never invents weaknesses', () => {
  for (const feedback of [analysis({ promptVersion: 'challenge-feedback-v3', missedCheckpointIndices: undefined }), analysis({ missedCheckpointIndices: [] })]) {
    const result = getThemeSummary('Tests', courses, [challenge], {}, [attempt('a')], { a: feedback })
    assert.deepEqual(result.notions, [])
    assert.equal(result.retriesWithoutNotions, 1)
  }
  for (const feedback of [analysis({ challengeVersion: 2 }), analysis({ rubricVersion: 2 }), analysis({ status: 'processing' })]) {
    assert.deepEqual(getThemeSummary('Tests', courses, [challenge], {}, [attempt('a')], { a: feedback }).notions, [])
  }
})

test('summary ignores other themes, inherited completion and invalid checkpoint indices', () => {
  const result = getThemeSummary('Tests', courses, [challenge, { ...challenge, id: 'other', courseId: 'elsewhere' }], Object.create({ one: 'date' }), [attempt('a')], { a: analysis({ missedCheckpointIndices: [-1, 1, 1, 2, 0.5] }) })
  assert.equal(result.lessonsCompleted, 0)
  assert.equal(result.examsTotal, 1)
  assert.deepEqual(result.notions, [{ challengeId: 'exam', checkpointIndex: 1, label: 'Clock' }])
})
