import assert from 'node:assert/strict'
import test from 'node:test'
import { assessmentForDraft, confirmedAssessmentDraft } from './assessmentResume.ts'
import type { EnterpriseLessonAssessment, EnterpriseLessonDraftSnapshot } from '../types/enterprise'
import type { EnterpriseLesson } from '../types/enterpriseContent'

const retryAt = '2026-11-06T23:00:00.000Z'
const assessment: EnterpriseLessonAssessment = { lessonId: 'ent-answer-or-action', attemptDay: '2026-11-06', contentVersion: 'current', answers: {}, checks: [], correct: 0, total: 2, finished: true, passed: false, retryAt, updatedAt: '2026-11-06T12:00:00.000Z' }
const snapshot: EnterpriseLessonDraftSnapshot = { organizationId: 'team', lessonId: assessment.lessonId, revision: 2, contentVersion: 'current', state: { stepId: 'practice', answers: {}, checkedIds: [], draft: 'Ma nouvelle proposition', practiceAnswers: {} }, updatedAt: '2026-11-06T23:01:00.000Z' }

test('a next-day saved restart restores its work before the first new quiz answer', () => {
  assert.equal(assessmentForDraft(assessment, snapshot, Date.parse('2026-11-07T08:00:00Z')), undefined)
  assert.equal(snapshot.state?.draft, 'Ma nouvelle proposition')
  assert.equal(assessmentForDraft(assessment, { ...snapshot, updatedAt: '2026-11-06T12:00:00Z' }, Date.parse('2026-11-07T08:00:00Z')), assessment)
  assert.equal(assessmentForDraft(assessment, { ...snapshot, state: null }, Date.parse('2026-11-07T08:00:00Z')), assessment)
})

test('same-day failures remain visible and stale uncommitted passes restart on changed content', () => {
  assert.equal(assessmentForDraft(assessment, snapshot, Date.parse('2026-11-06T22:00:00Z')), assessment)
  assert.equal(assessmentForDraft({ ...assessment, passed: true, contentVersion: 'old' }, snapshot), undefined)
  assert.equal(assessmentForDraft({ ...assessment, passed: true, retryAt: null }, snapshot)?.passed, true)
})

test('legacy local quiz checks cannot disable the new server-backed questions after rollout', () => {
  const lesson: EnterpriseLesson = { id: 'ent-legacy', chapterId: 'chapter', title: 'Legacy', estimatedMinutes: 5, objective: '', cards: [], sources: [], steps: [
    { id: 'intro', type: 'message', text: 'Le cas' },
    { id: 'q1', type: 'question', prompt: 'Un', options: [{ id: 'a', text: 'A', feedback: 'Explication' }], correctOptionId: 'a' },
    { id: 'q2', type: 'question', prompt: 'Deux', options: [{ id: 'a', text: 'A', feedback: 'Explication' }], correctOptionId: 'a' },
  ] }
  const legacy = { stepId: 'q2', answers: { q1: 'a' }, checkedIds: ['q1'], draft: 'Mon travail conservé', practiceAnswers: {} }
  const restored = confirmedAssessmentDraft(lesson, legacy)
  assert.equal(restored.stepId, 'q1')
  assert.deepEqual(restored.answers, {})
  assert.deepEqual(restored.checkedIds, [])
  assert.equal(restored.draft, legacy.draft)
  const confirmed = { ...assessment, answers: { q1: 'a' }, checks: [{ questionId: 'q1', selectedOptionId: 'a', correctOptionId: 'a', correct: true, explanation: 'Explication', questionText: 'Un', correctAnswerText: 'A', selectedAnswerText: 'A' }], finished: false }
  const resumed = confirmedAssessmentDraft(lesson, legacy, confirmed)
  assert.equal(resumed.stepId, 'q2')
  assert.deepEqual(resumed.answers, { q1: 'a' })
})
